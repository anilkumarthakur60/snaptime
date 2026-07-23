// ─────────────────────────────────────────────────────────────────────────────
// Token table — drives both formatting and parsing.
//
// Each token defines:
//   - format(c, l): produce string from DateComponents + ResolvedLocale
//   - parse?: regex string capturing the value (only for parse-supported tokens)
//   - apply?: how to apply the captured value to a partial DateObject
//
// Tokens are matched longest-first so that "MMMM" wins over "MMM" wins over "MM".
// ─────────────────────────────────────────────────────────────────────────────

import { pad, formatOffset, getOffsetMinutes } from '../core/helpers'
import type { ResolvedLocale } from '../locale/registry'

export interface DateComponents {
  date: number // 1-31
  day: number // 0=Sun..6=Sat
  dayOfYear: number
  hour: number // 0-23
  isoWeek: number
  isoWeekYear: number
  millisecond: number // 0-999
  minute: number // 0-59
  month: number // 1-12
  /** Native Date — used only for getTimezoneOffset(). */
  nativeDate: Date
  /** Override offset minutes (used for UTC-aware formatting). */
  offsetMinutes?: number
  quarter: number
  second: number // 0-59
  timestampMs: number
  year: number
}

export interface ParseTarget {
  date?: number
  dayOfYear?: number
  hour?: number
  hour12?: number
  /** Set when a captured value cannot be resolved (e.g. unknown month name). */
  invalid?: boolean
  meridiem?: 'am' | 'pm'
  millisecond?: number
  minute?: number
  month?: number
  second?: number
  timezoneOffsetMinutes?: number | 'Z'
  unixMillis?: number
  unixSeconds?: number
  year?: number
}

export interface FormatToken {
  /** Apply parsed string to the target. */
  apply?: (target: ParseTarget, raw: string, l: ResolvedLocale) => void
  /** Produce the string for this token. */
  format: (c: DateComponents, l: ResolvedLocale) => string
  /** Regex capture group for parsing. Undefined → token is format-only. */
  parse?: string
}

const NUM = '(\\d+)'
const NUM2 = '(\\d{1,2})'
const NUM3 = '(\\d{1,3})'
const NUM4 = '(\\d{4})'
const SIGNED = '(-?\\d+)'
const TZ = '([+-]\\d{2}:?\\d{2}|Z)'

function offsetOf(c: DateComponents): number {
  return c.offsetMinutes ?? getOffsetMinutes(c.nativeDate)
}

export const TOKENS: Record<string, FormatToken> = {
  // ── Year ──────────────────────────────────────────────────────────────────
  YYYY: {
    format: (c) => {
      const abs = String(Math.abs(c.year)).padStart(4, '0')
      return c.year < 0 ? `-${abs}` : abs
    },
    parse: NUM4,
    apply: (t, v) => {
      t.year = Number(v)
    }
  },
  YY: {
    format: (c) => String(c.year).slice(-2).padStart(2, '0'),
    parse: '(\\d{2})',
    apply: (t, v) => {
      const n = Number(v)
      t.year = n < 70 ? 2000 + n : 1900 + n
    }
  },
  Y: {
    format: (c) => String(c.year),
    parse: SIGNED,
    apply: (t, v) => {
      t.year = Number(v)
    }
  },

  // ── ISO week-year ─────────────────────────────────────────────────────────
  GGGG: { format: (c) => String(c.isoWeekYear).padStart(4, '0') },
  GG: { format: (c) => String(c.isoWeekYear).slice(-2).padStart(2, '0') },
  gggg: { format: (c) => String(c.isoWeekYear).padStart(4, '0') },
  gg: { format: (c) => String(c.isoWeekYear).slice(-2).padStart(2, '0') },

  // ── Quarter ──────────────────────────────────────────────────────────────
  Qo: { format: (c, l) => l.ordinal(c.quarter) },
  Q: { format: (c) => String(c.quarter) },

  // ── Month ────────────────────────────────────────────────────────────────
  MMMM: {
    format: (c, l) => l.months[c.month - 1] ?? String(c.month),
    parse: '([\\p{L}]+)',
    apply: (t, v, l) => {
      const idx = l.months.findIndex((m) => m.toLowerCase() === v.toLowerCase())
      if (idx >= 0) t.month = idx + 1
      else t.invalid = true
    }
  },
  MMM: {
    format: (c, l) => l.monthsShort[c.month - 1] ?? String(c.month),
    parse: '([\\p{L}]+)',
    apply: (t, v, l) => {
      const idx = l.monthsShort.findIndex((m) => m.toLowerCase() === v.toLowerCase())
      if (idx >= 0) t.month = idx + 1
      else t.invalid = true
    }
  },
  Mo: { format: (c, l) => l.ordinal(c.month) },
  MM: {
    format: (c) => pad(c.month),
    parse: NUM2,
    apply: (t, v) => {
      t.month = Number(v)
    }
  },
  M: {
    format: (c) => String(c.month),
    parse: NUM2,
    apply: (t, v) => {
      t.month = Number(v)
    }
  },

  // ── Day of year ──────────────────────────────────────────────────────────
  DDDD: {
    format: (c) => pad(c.dayOfYear, 3),
    parse: '(\\d{3})',
    apply: (t, v) => {
      t.dayOfYear = Number(v)
    }
  },
  DDDo: { format: (c, l) => l.ordinal(c.dayOfYear) },
  DDD: {
    format: (c) => String(c.dayOfYear),
    parse: NUM3,
    apply: (t, v) => {
      t.dayOfYear = Number(v)
    }
  },

  // ── Day of month ─────────────────────────────────────────────────────────
  Do: { format: (c, l) => l.ordinal(c.date) },
  DD: {
    format: (c) => pad(c.date),
    parse: NUM2,
    apply: (t, v) => {
      t.date = Number(v)
    }
  },
  D: {
    format: (c) => String(c.date),
    parse: NUM2,
    apply: (t, v) => {
      t.date = Number(v)
    }
  },

  // ── Day of week ──────────────────────────────────────────────────────────
  dddd: {
    format: (c, l) => l.weekdays[c.day] ?? String(c.day)
  },
  ddd: {
    format: (c, l) => l.weekdaysShort[c.day] ?? String(c.day)
  },
  dd: {
    format: (c, l) => l.weekdaysMin[c.day] ?? String(c.day)
  },
  do: { format: (c, l) => l.ordinal(c.day) },
  d: { format: (c) => String(c.day) },

  // ── ISO week ─────────────────────────────────────────────────────────────
  WW: { format: (c) => pad(c.isoWeek) },
  Wo: { format: (c, l) => l.ordinal(c.isoWeek) },
  W: { format: (c) => String(c.isoWeek) },

  // ── Hour 24h ─────────────────────────────────────────────────────────────
  HH: {
    format: (c) => pad(c.hour),
    parse: NUM2,
    apply: (t, v) => {
      t.hour = Number(v)
    }
  },
  H: {
    format: (c) => String(c.hour),
    parse: NUM2,
    apply: (t, v) => {
      t.hour = Number(v)
    }
  },

  // ── Hour 12h ─────────────────────────────────────────────────────────────
  hh: {
    format: (c) => pad(c.hour % 12 || 12),
    parse: NUM2,
    apply: (t, v) => {
      t.hour12 = Number(v)
    }
  },
  h: {
    format: (c) => String(c.hour % 12 || 12),
    parse: NUM2,
    apply: (t, v) => {
      t.hour12 = Number(v)
    }
  },

  // ── Hour 1-24 (ko/kk) ────────────────────────────────────────────────────
  kk: { format: (c) => pad(c.hour === 0 ? 24 : c.hour) },
  k: { format: (c) => String(c.hour === 0 ? 24 : c.hour) },

  // ── AM/PM ────────────────────────────────────────────────────────────────
  A: {
    format: (c, l) => l.meridiem(c.hour, c.minute, false),
    parse: '([AaPp][Mm])',
    apply: (t, v) => {
      t.meridiem = v.toLowerCase().startsWith('a') ? 'am' : 'pm'
    }
  },
  a: {
    format: (c, l) => l.meridiem(c.hour, c.minute, true),
    parse: '([AaPp][Mm])',
    apply: (t, v) => {
      t.meridiem = v.toLowerCase().startsWith('a') ? 'am' : 'pm'
    }
  },

  // ── Minute ───────────────────────────────────────────────────────────────
  mm: {
    format: (c) => pad(c.minute),
    parse: NUM2,
    apply: (t, v) => {
      t.minute = Number(v)
    }
  },
  m: {
    format: (c) => String(c.minute),
    parse: NUM2,
    apply: (t, v) => {
      t.minute = Number(v)
    }
  },

  // ── Second ───────────────────────────────────────────────────────────────
  ss: {
    format: (c) => pad(c.second),
    parse: NUM2,
    apply: (t, v) => {
      t.second = Number(v)
    }
  },
  s: {
    format: (c) => String(c.second),
    parse: NUM2,
    apply: (t, v) => {
      t.second = Number(v)
    }
  },

  // ── Fractional second ────────────────────────────────────────────────────
  SSS: {
    format: (c) => pad(c.millisecond, 3),
    parse: '(\\d{3})',
    apply: (t, v) => {
      t.millisecond = Number(v)
    }
  },
  SS: { format: (c) => pad(Math.floor(c.millisecond / 10), 2) },
  S: { format: (c) => String(Math.floor(c.millisecond / 100)) },

  // ── Timezone ─────────────────────────────────────────────────────────────
  ZZ: {
    format: (c) => formatOffset(offsetOf(c), ''),
    parse: TZ,
    apply: (t, v) => applyTz(t, v)
  },
  Z: {
    format: (c) => formatOffset(offsetOf(c), ':'),
    parse: TZ,
    apply: (t, v) => applyTz(t, v)
  },

  // ── Unix ─────────────────────────────────────────────────────────────────
  X: {
    format: (c) => String(Math.floor(c.timestampMs / 1000)),
    parse: SIGNED,
    apply: (t, v) => {
      t.unixSeconds = Number(v)
    }
  },
  x: {
    format: (c) => String(c.timestampMs),
    parse: NUM,
    apply: (t, v) => {
      t.unixMillis = Number(v)
    }
  }
}

function applyTz(t: ParseTarget, raw: string): void {
  if (raw === 'Z') {
    t.timezoneOffsetMinutes = 'Z'
    return
  }
  const m = /^([+-])(\d{2}):?(\d{2})$/.exec(raw)
  if (!m) return
  const sign = m[1] === '+' ? 1 : -1
  t.timezoneOffsetMinutes = sign * (Number(m[2]) * 60 + Number(m[3]))
}

/** Tokens sorted longest-first (used by both formatter and parser). */
export const TOKEN_KEYS: string[] = Object.keys(TOKENS).sort((a, b) => b.length - a.length)
