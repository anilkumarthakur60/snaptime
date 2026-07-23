// RFC 5545 RRULE — public types.

// Type-only import: keeps the `snaptime/rrule` subpath tree-shakable (no
// runtime dependency is added by referencing the DateTime type here).
import type DateTime from '../core/DateTime'

export type Freq = 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'HOURLY' | 'MINUTELY' | 'SECONDLY'

export type Weekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU'

/**
 * Any instant the RRULE engine accepts: a native Date, epoch milliseconds, a
 * parseable date string, or a snaptime DateTime (coerced via `valueOf()`).
 */
export type DateTimeInput = Date | number | string | DateTime

/** A weekday with optional occurrence index. e.g. `{ day: 'MO', n: 2 }` = 2nd Monday. */
export interface WeekdayWithN {
  day: Weekday
  /** 1..53, -1..-53. Omitted for "every Monday" semantics. */
  n?: number
}

export interface RRuleOptions {
  byhour?: number[]
  byminute?: number[]
  bymonth?: number[]
  bymonthday?: number[]
  bysecond?: number[]

  bysetpos?: number[]
  // BY* filters
  byweekday?: (Weekday | WeekdayWithN)[]
  byweekno?: number[]
  byyearday?: number[]
  /** Maximum number of occurrences. Mutually exclusive with `until`. */
  count?: number
  /** Anchor instant — defaults to "now" if not specified. */
  dtstart?: DateTimeInput
  freq: Freq
  /** Stride. Default 1. */
  interval?: number
  /** Stop instant (inclusive). Mutually exclusive with `count`. */
  until?: DateTimeInput

  /** Week start. Default 'MO'. */
  wkst?: Weekday
}
