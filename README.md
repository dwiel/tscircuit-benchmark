# tscircuit Autorouting Benchmark

36 real-world PCB designs exported as circuit JSON from [pcbgen](https://github.com/dwiel/ai-pcb-experiment), an AI-driven PCB design pipeline built on [tscircuit](https://github.com/tscircuit/tscircuit).

These boards range from 3 to 35 components and were generated from plain-English specs by an LLM, then routed with Freerouting. All are 2-layer boards.

## Files

- `ts*.circuit.json` — circuit JSON files, one per board
- `metadata.json` — routing comparison data (freerouting vs auto-cloud)

## Board Summary

| Board | Components | Nets | Freerouting | Auto-Cloud |
|-------|-----------|------|-------------|------------|
| ts01_led | 3 | 0 | clean | clean |
| ts02_voltage_divider | 3 | 0 | clean | clean |
| ts03_rc_filter | 3 | 0 | clean | clean |
| ts04_dual_led | 5 | 0 | clean | 15 errors |
| ts05_npn_switch | 5 | 0 | clean | 2 errors |
| ts06_push_pull | 7 | 0 | clean | 5 errors |
| ts07_differential_pair | 8 | 5 | clean | 17 errors |
| ts08_inverting_amp | 5 | 4 | clean | clean |
| ts09_active_filter | 7 | 5 | clean | 9 errors |
| ts10_wheatstone_bridge | 6 | 4 | clean | clean |
| ts11_generated | 16 | 9 | clean | 135 errors |
| ts12_generated | 9 | 5 | clean | 1 error |
| ts13_555_blinker | 10 | 4 | clean | unrouted |
| ts14_usb_power | 9 | 3 | clean | 2 errors |
| ts15_i2c_sensor | 6 | 4 | clean | clean |
| ts16_h_bridge | 9 | 12 | clean | 15 errors |
| ts17_attiny_minimal | 7 | 8 | clean | unrouted |
| ts18_dual_reg | 20 | 13 | clean | unrouted |
| ts19_adc_breakout | 10 | 8 | clean | unrouted |
| ts20_esp32_wifi | 19 | 9 | clean | 208 errors |
| ts21_current_sensor | 6 | 6 | clean | unrouted |
| ts22_rs485 | 5 | 5 | clean | unrouted |
| ts23_lipo_charger | 9 | 5 | clean | 32 errors |
| ts24_dac_output | 8 | 6 | clean | 28 errors |
| ts25_level_shifter | 16 | 11 | clean | 15 errors |
| ts26_eeprom | 6 | 6 | clean | 15 errors |
| ts27_rtc | 6 | 5 | clean | 31 errors |
| ts28_boost | 9 | 5 | clean | clean |
| ts29_comparator | 8 | 7 | not routed | unrouted |
| ts30_can | 5 | 5 | clean | unrouted |
| ts31_motor_driver | 17 | 12 | clean | unrouted |
| ts32_usb_pd_trigger | 12 | 6 | clean | 6 errors |
| ts33_risc_v_dev | 19 | 7 | clean | 136 errors |
| ts34_usb_can | 25 | 8 | clean | 128 errors |
| ts35_thermocouple | 8 | 3 | clean | unrouted |
| ts36_esc | 35 | 10 | clean | unrouted |

### Routing Comparison

- **Both clean**: 7 boards (ts01, ts02, ts03, ts08, ts10, ts15, ts28)
- **Auto-cloud routed with errors**: 17 boards
- **Freerouting-only** (auto-cloud returned 0 traces): 10 boards
- **Neither routed**: 1 board (ts29)

## How These Were Made

Each board starts as a plain-English `spec.md` file describing the circuit. An LLM generates tscircuit TSX code, which is exported to KiCad PCB format and routed with Freerouting (Java-based DSN autorouter). The pipeline validates with KiCad DRC.

Auto-cloud results were collected by injecting `autorouter={{ preset: "auto-cloud" }}` into the board element and re-exporting via `tsci`. Tested March 2026.

## License

MIT
