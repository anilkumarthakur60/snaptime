import { defineConfig } from 'tsup'

// Sub-path entries — each becomes its own bundle so consumers can import
// `@anil-labs/snaptime/locale/fr` (or any other module) without pulling the
// rest of the library into their bundle. Locale modules register themselves
// into the shared registry, so `splitting` is required for BOTH formats:
// every entry must resolve the registry from a shared chunk, not an inlined
// per-entry copy.
const ENTRIES = {
  index: 'src/index.ts',
  rrule: 'src/rrule/index.ts',
  astronomy: 'src/astronomy/index.ts',
  validate: 'src/validate/index.ts',
  'calendars/bs': 'src/calendars/bs/index.ts',
  'collections/RangeSet': 'src/collections/RangeSet.ts',
  'locale/en': 'src/locale/default.ts',
  'locale/es': 'src/locale/locales/es.ts',
  'locale/fr': 'src/locale/locales/fr.ts',
  'locale/de': 'src/locale/locales/de.ts',
  'locale/ja': 'src/locale/locales/ja.ts',
  'locale/zh-cn': 'src/locale/locales/zh-cn.ts',
  'locale/hi': 'src/locale/locales/hi.ts',
  'locale/pt': 'src/locale/locales/pt.ts',
  'locale/it': 'src/locale/locales/it.ts',
  'locale/ar': 'src/locale/locales/ar.ts',
  'locale/ne': 'src/locale/locales/ne.ts',
  'locale/ko': 'src/locale/locales/ko.ts',
  'locale/vi': 'src/locale/locales/vi.ts',
  'locale/tr': 'src/locale/locales/tr.ts',
  'locale/ru': 'src/locale/locales/ru.ts',
  'locale/nl': 'src/locale/locales/nl.ts',
  'locale/pl': 'src/locale/locales/pl.ts',
  'locale/id': 'src/locale/locales/id.ts',
  'locale/th': 'src/locale/locales/th.ts'
}

export default defineConfig([
  // ESM (.js) + CJS (.cjs) for bundlers/Node.
  {
    entry: ENTRIES,
    format: ['esm', 'cjs'],
    splitting: true,
    dts: true,
    clean: true,
    treeshake: true,
    sourcemap: true,
    target: 'es2020',
    tsconfig: 'tsconfig.tsup.json'
  },
  // IIFE (index.global.js) exposing `Snaptime` for direct CDN <script> usage.
  {
    entry: { index: 'src/index.ts' },
    format: ['iife'],
    globalName: 'Snaptime',
    dts: false,
    clean: false,
    treeshake: true,
    sourcemap: true,
    target: 'es2020',
    tsconfig: 'tsconfig.tsup.json'
  }
])
