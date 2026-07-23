import { TOKENS, TOKEN_KEYS, type ParseTarget } from './tokens'
import type { ResolvedLocale } from '../locale/registry'
import { daysInMonth } from '../core/helpers'

const ESC = ''

/**
 * Parsing strategy:
 *   1. Stash [literal] segments.
 *   2. Walk the format, building (a) a regex pattern and (b) an ordered list of
 *      tokens whose captures correspond to regex groups.
 *   3. Run the regex against the input.
 *   4. Apply each captured value to the ParseTarget via the token's `apply`.
 *   5. Resolve the ParseTarget into a UTC ms timestamp + offset metadata.
 */
export interface ParseResult {
  /** Whether the input contained an explicit timezone offset / Z. */
  hadOffset: boolean
  /** Whether the input contained an explicit Z (UTC). */
  hadZ: boolean
  /** Either the resolved millisecond timestamp (UTC) or NaN if invalid. */
  ms: number
  /** Raw target — exposed for debugging. */
  target: ParseTarget
}

const REGEX_META = /[.*+?^${}()|[\]\\]/g

export function parseWithFormat(
  input: string,
  fmt: string,
  locale: ResolvedLocale,
  strict = false
): ParseResult {
  // Stash literals. Pre-existing ESC sentinel characters in the format string
  // are stashed as literals too, so the only ESC chars left in `stashed` are
  // the ones we emitted — embedded U+0001 can never corrupt index decoding.
  const literals: string[] = []
  // eslint-disable-next-line no-control-regex -- U+0001 is the stash sentinel; matching it is the point
  const stashed = fmt.replace(/\[([^\]]*)\]|\u0001/gu, (match, txt: string | undefined) => {
    literals.push(txt ?? match)
    return `${ESC}${literals.length - 1}${ESC}`
  })

  let pattern = ''
  const orderedTokens: string[] = []

  for (let i = 0; i < stashed.length;) {
    const ch = stashed[i]!
    if (ch === ESC) {
      const end = stashed.indexOf(ESC, i + 1)
      const idx = Number(stashed.substring(i + 1, end))
      pattern += literals[idx]!.replace(REGEX_META, '\\$&')
      i = end + 1
      continue
    }
    let matched: string | null = null
    for (const tok of TOKEN_KEYS) {
      if (stashed.startsWith(tok, i) && TOKENS[tok]?.parse) {
        matched = tok
        break
      }
    }
    if (matched) {
      pattern += TOKENS[matched]!.parse
      orderedTokens.push(matched)
      i += matched.length
    } else {
      // Treat as literal
      pattern += ch.replace(REGEX_META, '\\$&').replace(/\s/g, '\\s')
      i++
    }
  }

  const re = new RegExp(`^${pattern}$`, 'u')
  const m = re.exec(input.trim())
  const target: ParseTarget = {}
  if (!m) return { ms: NaN, hadOffset: false, hadZ: false, target }

  for (let i = 0; i < orderedTokens.length; i++) {
    const tok = orderedTokens[i]!
    const raw = m[i + 1]
    if (raw == null) continue
    TOKENS[tok]?.apply?.(target, raw, locale)
  }

  // A token matched textually but could not be resolved (e.g. a month name
  // that exists in no locale table). That is garbage in any mode, not leniency.
  if (target.invalid) return { ms: NaN, hadOffset: false, hadZ: false, target }

  // Direct unix overrides
  if (target.unixMillis != null) {
    return { ms: target.unixMillis, hadOffset: true, hadZ: true, target }
  }
  if (target.unixSeconds != null) {
    return { ms: target.unixSeconds * 1000, hadOffset: true, hadZ: true, target }
  }

  if (strict) {
    if (target.month != null && (target.month < 1 || target.month > 12)) {
      return { ms: NaN, hadOffset: false, hadZ: false, target }
    }
    if (target.month != null && target.date != null) {
      const dim = daysInMonth(target.year ?? 1970, target.month)
      if (target.date < 1 || target.date > dim) {
        return { ms: NaN, hadOffset: false, hadZ: false, target }
      }
    }
    if (target.hour != null && (target.hour < 0 || target.hour > 23)) {
      return { ms: NaN, hadOffset: false, hadZ: false, target }
    }
    if (target.minute != null && (target.minute < 0 || target.minute > 59)) {
      return { ms: NaN, hadOffset: false, hadZ: false, target }
    }
    if (target.second != null && (target.second < 0 || target.second > 59)) {
      return { ms: NaN, hadOffset: false, hadZ: false, target }
    }
  }

  // Resolve hour12 + meridiem → hour
  if (target.hour12 != null) {
    let h = target.hour12 % 12
    if (target.meridiem === 'pm') h += 12
    target.hour = h
  }

  const Y = target.year ?? 1970
  let M = (target.month ?? 1) - 1
  let D = target.date ?? 1

  // Day-of-year resolves the date fields only — time-of-day and offset fields
  // parsed alongside it are preserved.
  if (target.dayOfYear != null) {
    let doy = target.dayOfYear
    M = 0
    while (M < 11 && doy > daysInMonth(Y, M + 1)) {
      doy -= daysInMonth(Y, M + 1)
      M++
    }
    D = doy
  }

  const h = target.hour ?? 0
  const min = target.minute ?? 0
  const s = target.second ?? 0
  const ms = target.millisecond ?? 0

  let unixMs: number
  let hadOffset = false
  let hadZ = false

  if (target.timezoneOffsetMinutes === 'Z') {
    unixMs = Date.UTC(Y, M, D, h, min, s, ms)
    hadOffset = true
    hadZ = true
  } else if (typeof target.timezoneOffsetMinutes === 'number') {
    unixMs = Date.UTC(Y, M, D, h, min, s, ms) - target.timezoneOffsetMinutes * 60_000
    hadOffset = true
  } else {
    // No offset specified — interpret as local time
    unixMs = new Date(Y, M, D, h, min, s, ms).getTime()
  }

  return { ms: unixMs, hadOffset, hadZ, target }
}
