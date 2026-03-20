import {
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { join } from "node:path"

type ConnectionLike = {
  name?: string
  externallyConnectedPointIds?: unknown
  [key: string]: unknown
}

type SimpleRouteJsonLike = {
  connections?: ConnectionLike[]
  [key: string]: unknown
}

const rootDir = import.meta.dir + "/.."
const samplesDir = join(rootDir, "samples")
mkdirSync(samplesDir, { recursive: true })

const isCheckMode = process.argv.includes("--check")

const sanitizeSimpleRouteJson = (
  simpleRouteJson: SimpleRouteJsonLike,
): { sanitized: SimpleRouteJsonLike; removedConnectionCount: number } => {
  const connections = simpleRouteJson.connections ?? []
  let removedConnectionCount = 0

  const sanitizedConnections = connections.map((connection) => {
    const { externallyConnectedPointIds, ...rest } = connection
    if (externallyConnectedPointIds !== undefined) {
      removedConnectionCount += 1
    }
    return rest
  })

  return {
    sanitized: {
      ...simpleRouteJson,
      connections: sanitizedConnections,
    },
    removedConnectionCount,
  }
}

const validateSamples = () => {
  const sampleFiles = readdirSync(samplesDir)
    .filter((file) => file.endsWith(".json"))
    .sort()

  const violations: Array<{ file: string; connectionName: string }> = []

  for (const file of sampleFiles) {
    const samplePath = join(samplesDir, file)
    const sample = JSON.parse(readFileSync(samplePath, "utf-8")) as {
      connections?: ConnectionLike[]
    }

    for (const connection of sample.connections ?? []) {
      if (connection.externallyConnectedPointIds !== undefined) {
        violations.push({
          file,
          connectionName: connection.name ?? "(unnamed)",
        })
      }
    }
  }

  if (violations.length > 0) {
    console.error(
      `Validation failed: found externallyConnectedPointIds in ${violations.length} connections across sample files.`,
    )
    for (const violation of violations.slice(0, 25)) {
      console.error(`- ${violation.file}: ${violation.connectionName}`)
    }
    if (violations.length > 25) {
      console.error(`...and ${violations.length - 25} more`)
    }
    process.exit(1)
  }

  console.log(
    `Validation passed: ${sampleFiles.length} sample files contain no externallyConnectedPointIds.`,
  )
}

const run = async () => {
  if (isCheckMode) {
    validateSamples()
    return
  }

  const circuitFiles = readdirSync(rootDir)
    .filter((file) => file.endsWith(".circuit.json"))
    .sort()

  let generatedSampleCount = 0
  if (circuitFiles.length > 0) {
    // Lazy import so check-only mode doesn't require @tscircuit/core.
    const { getSimpleRouteJsonFromCircuitJson } = await import("@tscircuit/core")

    for (const file of circuitFiles) {
      const name = file.replace(".circuit.json", "")
      const circuitJson = JSON.parse(readFileSync(join(rootDir, file), "utf-8"))

      try {
        const { simpleRouteJson } = getSimpleRouteJsonFromCircuitJson({
          circuitJson,
        })
        const { sanitized } = sanitizeSimpleRouteJson(simpleRouteJson)
        const outPath = join(samplesDir, `${name}.json`)
        writeFileSync(outPath, `${JSON.stringify(sanitized, null, 2)}\n`)
        generatedSampleCount += 1
        console.log(`✓ generated ${name}`)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`✗ ${name}: ${message}`)
      }
    }
  } else {
    console.log("No .circuit.json files found; skipping generation step.")
  }

  const sampleFiles = readdirSync(samplesDir)
    .filter((file) => file.endsWith(".json"))
    .sort()

  let sanitizedFileCount = 0
  let totalRemovedConnectionCount = 0

  for (const file of sampleFiles) {
    const samplePath = join(samplesDir, file)
    const sample = JSON.parse(
      readFileSync(samplePath, "utf-8"),
    ) as SimpleRouteJsonLike

    const { sanitized, removedConnectionCount } = sanitizeSimpleRouteJson(sample)
    if (removedConnectionCount > 0) {
      writeFileSync(samplePath, `${JSON.stringify(sanitized, null, 2)}\n`)
      sanitizedFileCount += 1
      totalRemovedConnectionCount += removedConnectionCount
    }
  }

  console.log(
    `Prepared samples: generated=${generatedSampleCount}, sanitizedFiles=${sanitizedFileCount}/${sampleFiles.length}, removedExternallyConnectedPointIds=${totalRemovedConnectionCount}`,
  )
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`prepare-samples failed: ${message}`)
  process.exit(1)
})
