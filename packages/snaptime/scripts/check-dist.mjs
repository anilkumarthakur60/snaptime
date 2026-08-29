/**
 * Post-build guard (pattern shared with js-match's check-dist.mjs).
 *
 * 1. SIZE BUDGETS  the main entries are the ones consumers pay for; a sudden
 *    jump means something was pulled in that should not have been.
 *
 * 2. NODE16 DECLARATION RESOLUTION  assert no emitted declaration carries an
 *    extensionless relative specifier. Those are illegal under
 *    `moduleResolution: "node16"`/"nodenext", and since nearly every consumer
 *    runs `skipLibCheck: true` the diagnostic is swallowed while resolution
 *    still fails  silently degrading the public API to `any`.
 *
 * 3. EXPORTS-MAP INTEGRITY  with 8 subpath patterns × 4 artifacts each plus a
 *    `locale/*` wildcard, a partial build is a real risk. Every concrete file
 *    referenced by `exports`, `typesVersions`, `main`/`module`/`types`, and
 *    `unpkg` must exist, and every locale must ship all four artifacts
 *    (.js/.cjs/.d.ts/.d.cts).
 *
 * 4. NO SOURCEMAPS  maps were 63% of the unpacked tarball before being
 *    dropped; a stray `sourcemap: true` should not creep back in.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PKG_DIR = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const DIST = join(PKG_DIR, 'dist')
const KB = 1024

let failed = false
const fail = (msg) => {
  failed = true
  console.error(`[check-dist] ${msg}`)
}

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const files = walk(DIST)

// ── 1. Size budgets (KB)  ~15% headroom over the current build. ──────────
const SIZE_BUDGETS = {
  'index.js': 40,
  'index.cjs': 45,
  'index.global.js': 105
}

const pad = (s, n) => String(s).padEnd(n)
console.log(
  `\n${pad('file', 20)} ${pad('size', 12)} ${pad('budget', 10)} status\n` +
    `${'-'.repeat(20)} ${'-'.repeat(12)} ${'-'.repeat(10)} ${'-'.repeat(20)}`
)
for (const [rel, limit] of Object.entries(SIZE_BUDGETS)) {
  let kb
  try {
    kb = statSync(join(DIST, rel)).size / KB
  } catch {
    fail(`MISSING expected build output: ${rel}`)
    continue
  }
  const over = kb > limit
  if (over) failed = true
  console.log(
    `${pad(rel, 20)} ${pad(`${kb.toFixed(1)} KB`, 12)} ${pad(`${limit} KB`, 10)} ${
      over ? `OVER (+${(kb - limit).toFixed(1)} KB)` : 'ok'
    }`
  )
}

// ── 2. Extensionless relative specifiers in declarations. ─────────────────
const RELATIVE_SPECIFIER = /(?:from\s*|import\(\s*)['"](\.[^'"]*)['"]/g
const decls = files.filter((f) => /\.d\.(ts|cts|mts)$/.test(f))
const offenders = []
for (const file of decls) {
  for (const [, spec] of readFileSync(file, 'utf8').matchAll(RELATIVE_SPECIFIER)) {
    if (!/\.(js|cjs|mjs)$/.test(spec)) offenders.push(`${relative(DIST, file)} -> ${spec}`)
  }
}
if (offenders.length > 0) {
  fail(`${offenders.length} extensionless relative specifier(s) in emitted declarations:`)
  for (const o of offenders.slice(0, 20)) console.error(`  ${o}`)
} else {
  console.log(
    `\n[check-dist] ${decls.length} declaration files: no extensionless relative specifiers.`
  )
}

// ── 3. Every file the manifest points at must exist. ──────────────────────
const pkg = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))

const refs = new Set()
const collect = (node) => {
  if (typeof node === 'string') {
    if (node.startsWith('./dist/')) refs.add(node)
  } else if (Array.isArray(node)) {
    node.forEach(collect)
  } else if (node && typeof node === 'object') {
    Object.values(node).forEach(collect)
  }
}
collect(pkg.exports)
collect(pkg.typesVersions)
for (const field of ['main', 'module', 'types', 'unpkg', 'jsdelivr']) collect(pkg[field])

let missing = 0
for (const ref of refs) {
  if (ref.includes('*')) {
    // Wildcard (locale/*): assert the pattern matches at least one file; the
    // per-locale completeness check below does the rest.
    const [prefix, suffix] = ref.replace('./', '').split('*')
    const hit = files.some((f) => relative(PKG_DIR, f).startsWith(prefix) && f.endsWith(suffix))
    if (!hit) {
      fail(`exports pattern matches nothing on disk: ${ref}`)
      missing++
    }
  } else if (!existsSync(join(PKG_DIR, ref))) {
    fail(`manifest references missing file: ${ref}`)
    missing++
  }
}
if (missing === 0) {
  console.log(`[check-dist] ${refs.size} manifest references: all resolve on disk.`)
}

// Every locale must ship all four artifacts.
const LOCALE_EXTS = ['.js', '.cjs', '.d.ts', '.d.cts']
const localeNames = [
  ...new Set(
    readdirSync(join(DIST, 'locale'))
      .map((f) => f.replace(/\.(d\.)?(ts|cts|js|cjs)$/, ''))
      .filter(Boolean)
  )
]
let incomplete = 0
for (const name of localeNames) {
  for (const ext of LOCALE_EXTS) {
    if (!existsSync(join(DIST, 'locale', `${name}${ext}`))) {
      fail(`locale "${name}" is missing dist/locale/${name}${ext}`)
      incomplete++
    }
  }
}
if (incomplete === 0) {
  console.log(`[check-dist] ${localeNames.length} locales: all ship .js/.cjs/.d.ts/.d.cts.`)
}

// ── 4. Sourcemaps must not creep back in. ─────────────────────────────────
const maps = files.filter((f) => f.endsWith('.map'))
if (maps.length > 0) {
  fail(`${maps.length} sourcemap file(s) in dist  sourcemaps are deliberately off.`)
}

if (failed) {
  console.error('\n[check-dist] FAILED')
  process.exit(1)
}
console.log('[check-dist] all checks passed.\n')
