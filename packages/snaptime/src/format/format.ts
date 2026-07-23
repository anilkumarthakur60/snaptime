import { TOKENS, TOKEN_KEYS, type DateComponents } from './tokens'
import type { ResolvedLocale } from '../locale/registry'

const ESC = ''

/**
 * Format a date by token expansion. Square-bracket [literal] sequences are
 * passed through verbatim. Long-form tokens (LT, LL, ...) are recursively
 * expanded from the locale's longDateFormat table before token replacement.
 */
export function formatDate(fmt: string, c: DateComponents, locale: ResolvedLocale): string {
  // Expand long-format tokens first (LT, LTS, L, LL, LLL, LLLL, l, ll, lll, llll)
  fmt = expandLongFormat(fmt, locale)

  // Stash square-bracket literals. Pre-existing ESC sentinel characters in the
  // format string are stashed as literals too, so the only ESC chars left in
  // `stashed` are the ones we emitted — embedded U+0001 stays a plain literal.
  const literals: string[] = []
  // eslint-disable-next-line no-control-regex -- U+0001 is the stash sentinel; matching it is the point
  const stashed = fmt.replace(/\[([^\]]*)\]|\u0001/gu, (match, txt: string | undefined) => {
    literals.push(txt ?? match)
    return `${ESC}${literals.length - 1}${ESC}`
  })

  // Token replacement (longest-first)
  let out = ''
  for (let i = 0; i < stashed.length;) {
    const ch = stashed[i]
    if (ch === ESC) {
      const end = stashed.indexOf(ESC, i + 1)
      out += literals[Number(stashed.substring(i + 1, end))]
      i = end + 1
      continue
    }
    let matched: string | null = null
    for (const tok of TOKEN_KEYS) {
      if (stashed.startsWith(tok, i)) {
        matched = tok
        break
      }
    }
    if (matched) {
      out += TOKENS[matched]!.format(c, locale)
      i += matched.length
    } else {
      out += ch
      i++
    }
  }
  return out
}

const LONG_TOKENS = ['LTS', 'LT', 'LLLL', 'LLL', 'LL', 'L', 'llll', 'lll', 'll', 'l']

function expandLongFormat(fmt: string, locale: ResolvedLocale): string {
  // Stash literals to avoid expanding inside [LT]. Pre-existing ESC sentinel
  // characters are stashed too so they cannot corrupt index decoding below.
  const literals: string[] = []
  // eslint-disable-next-line no-control-regex -- U+0001 is the stash sentinel; matching it is the point
  const stashed = fmt.replace(/\[([^\]]*)\]|\u0001/gu, (match, txt: string | undefined) => {
    literals.push(txt ?? match)
    return `${ESC}${literals.length - 1}${ESC}`
  })

  let result = stashed
  // Iterate to handle locale entries that themselves reference long tokens
  for (let pass = 0; pass < 4; pass++) {
    let changed = false
    for (const tok of LONG_TOKENS) {
      const re = new RegExp(tok, 'g')
      const replacement = locale.longDateFormat[tok as keyof typeof locale.longDateFormat]
      if (replacement && re.test(result)) {
        result = result.replace(re, replacement)
        changed = true
      }
    }
    if (!changed) break
  }

  // Restore literals
  return result.replace(
    new RegExp(`${ESC}(\\d+)${ESC}`, 'g'),
    (_, idx) => `[${literals[Number(idx)]}]`
  )
}
