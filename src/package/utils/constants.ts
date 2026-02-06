import type { Unit } from '../type'

/** Milliseconds per unit (approximations for month/year) */
export const UNIT_MS: Record<Unit, number> = {
  millisecond: 1,
  second: 1e3,
  minute: 6e4,
  hour: 36e5,
  day: 864e5,
  date: 864e5,
  month: 2592e6, // ~30 days
  year: 31536e6, // ~365 days
  fortnight: 1209.6e6, // 14 days
  unknown: NaN,
  week: 6048e5, // 7 days
  quarter: 7776e6 // ~3 months
}

/** Token → regex pattern for parsing */
export const TOK_RE: Record<string, string> = {
  YYYY: '(\\d{4})',
  MM: '(\\d{1,2})',
  DD: '(\\d{1,2})',
  HH: '(\\d{1,2})',
  hh: '(\\d{1,2})',
  mm: '(\\d{1,2})',
  ss: '(\\d{1,2})',
  X: '(-?\\d+)', // unix seconds
  x: '(-?\\d+)', // unix ms
  DDD: '(\\d{1,3})', // day of the year
  DDDD: '(\\d{3})',
  Z: '([+-]\\d{2}:?\\d{2}|Z)'
}

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
export const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/
