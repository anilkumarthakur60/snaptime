// The CDN demo is a plain HTML file — its "build" verifies the IIFE global
// bundle it loads actually exists, exposes the expected global, and works.
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const bundle = fileURLToPath(
  new URL('../../packages/snaptime/dist/index.global.js', import.meta.url)
)

const source = await readFile(bundle, 'utf8')
if (!source.includes('Snaptime')) {
  throw new Error(`Global bundle exists but does not define the Snaptime global: ${bundle}`)
}

// Execute the IIFE in a bare context and exercise the API the demo page uses.
const context = vm.createContext({})
vm.runInContext(source, context)
const { Snaptime } = context
if (typeof Snaptime?.dateTime !== 'function') {
  throw new Error('Snaptime.dateTime is not a function after evaluating the IIFE bundle')
}
const formatted = Snaptime.dateTime('2026-01-15T10:30:00').format('YYYY-MM-DD')
if (formatted !== '2026-01-15') {
  throw new Error(`Snaptime.dateTime().format() returned ${formatted}, expected 2026-01-15`)
}
console.log('cdn example OK — index.global.js present, exposes Snaptime, and formats dates')
