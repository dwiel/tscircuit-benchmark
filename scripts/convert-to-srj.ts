import { getSimpleRouteJsonFromCircuitJson } from "@tscircuit/core"
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { join } from "path"

const rootDir = import.meta.dir + "/.."
const samplesDir = join(rootDir, "samples")
mkdirSync(samplesDir, { recursive: true })

const circuitFiles = readdirSync(rootDir)
  .filter((f) => f.endsWith(".circuit.json"))
  .sort()

for (const file of circuitFiles) {
  const name = file.replace(".circuit.json", "")
  const circuitJson = JSON.parse(readFileSync(join(rootDir, file), "utf-8"))

  try {
    const { simpleRouteJson } = getSimpleRouteJsonFromCircuitJson({
      circuitJson,
    })
    const outPath = join(samplesDir, `${name}.json`)
    writeFileSync(outPath, JSON.stringify(simpleRouteJson, null, 2))
    console.log(`✓ ${name}`)
  } catch (e: any) {
    console.error(`✗ ${name}: ${e.message}`)
  }
}
