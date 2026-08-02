import { defineConfig } from 'tsup'

// Sub-path entries — each becomes its own bundle so consumers can import
// `@anil-labs/snaptime/locale/fr` (or any other module) without pulling the
// rest of the library into their bundle. Locale modules register themselves
// into the shared registry, so `splitting` is required for BOTH formats:
// every entry must resolve the registry from a shared chunk, not an inlined
// per-entry copy.
//
// `treeshake` is deliberately NOT enabled: it runs a second rollup pass over
// esbuild's output, which emits a duplicate `//# sourceMappingURL=` comment in
// every artifact and warns about our (intentional) default-plus-named exports.
// esbuild already tree-shakes, and consumers bundle the ESM entry themselves —
// the pass only shrinks the shared CJS chunks, ~1.7% gzipped overall, while
// making the ESM/CJS entry files slightly *larger*.
//
// No sourcemaps: they were 63% of the unpacked tarball (1.3 MB of maps for
// 780 KB of code), do not affect consumers' bundle size (bundlers strip
// them), and the test suite runs against `src` rather than `dist`.
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
    sourcemap: false,
    target: 'es2020',
    tsconfig: 'tsconfig.tsup.json'
  },
  // IIFE (index.global.js) exposing `Snaptime` for direct CDN <script> usage.
  // Minified: unpkg/jsdelivr serve this file byte-for-byte, so unlike the
  // ESM/CJS builds there is no consumer bundler to do the minification.
  {
    entry: { index: 'src/index.ts' },
    format: ['iife'],
    globalName: 'Snaptime',
    minify: true,
    dts: false,
    // The library build owns `clean`; this pass must not wipe it.
    clean: false,
    sourcemap: false,
    target: 'es2020',
    tsconfig: 'tsconfig.tsup.json'
  }
])
