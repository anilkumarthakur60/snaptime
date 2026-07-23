// ─────────────────────────────────────────────────────────────────────────────
// Core public types for the library.
// All other modules import from here. Keep this file free of runtime
// dependencies — type-only imports are fine.
// ─────────────────────────────────────────────────────────────────────────────

import type DateTime from './DateTime'
import type { BoundaryUnit, RoundToUnit } from './manipulate'

// ── Time units ──────────────────────────────────────────────────────────────

export type Unit =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'date'
  | 'week'
  | 'fortnight'
  | 'month'
  | 'quarter'
  | 'year'
  | 'decade'
  | 'century'
  | 'millennium'

export type UnitInput =
  | Unit
  | 'ms'
  | 'milliseconds'
  | 's'
  | 'seconds'
  | 'm'
  | 'minutes'
  | 'h'
  | 'hours'
  | 'd'
  | 'days'
  | 'D'
  | 'dates'
  | 'w'
  | 'weeks'
  | 'M'
  | 'months'
  | 'Q'
  | 'quarters'
  | 'y'
  | 'years'

/**
 * Units valid for startOf/endOf/floor/ceil/round.
 * Source of truth lives next to the boundary implementation in ./manipulate.
 */
export type { BoundaryUnit, RoundToUnit } from './manipulate'

/** Boundary units plus every alias that resolves to one of them. */
export type BoundaryUnitInput =
  | BoundaryUnit
  | 'y'
  | 'yr'
  | 'yrs'
  | 'years'
  | 'Q'
  | 'quarters'
  | 'M'
  | 'months'
  | 'w'
  | 'weeks'
  | 'd'
  | 'days'
  | 'D'
  | 'dates'
  | 'h'
  | 'hr'
  | 'hrs'
  | 'hours'
  | 'm'
  | 'min'
  | 'mins'
  | 'minutes'
  | 's'
  | 'sec'
  | 'secs'
  | 'seconds'
  | 'ms'
  | 'milliseconds'

/** Fixed-size sub-day units accepted by `roundTo`, plus their aliases. */
export type RoundToUnitInput =
  | RoundToUnit
  | 'h'
  | 'hr'
  | 'hrs'
  | 'hours'
  | 'm'
  | 'min'
  | 'mins'
  | 'minutes'
  | 's'
  | 'sec'
  | 'secs'
  | 'seconds'
  | 'ms'
  | 'milliseconds'

/** Units accepted by `set()` — the fields a JS Date can actually store. */
export type SettableUnit = 'year' | 'month' | 'date' | 'hour' | 'minute' | 'second' | 'millisecond'

/** Settable units plus every alias that resolves to one of them. */
export type SettableUnitInput =
  | SettableUnit
  | 'y'
  | 'yr'
  | 'yrs'
  | 'years'
  | 'M'
  | 'months'
  | 'D'
  | 'dates'
  | 'h'
  | 'hr'
  | 'hrs'
  | 'hours'
  | 'm'
  | 'min'
  | 'mins'
  | 'minutes'
  | 's'
  | 'sec'
  | 'secs'
  | 'seconds'
  | 'ms'
  | 'milliseconds'

/** Iso/locale weekday — 0=Sunday in JS Date, but we expose 1=Monday for ISO. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

// ── Date inputs ─────────────────────────────────────────────────────────────

/**
 * Anything that has been seen by the library: a primitive timestamp, a string,
 * a native Date, or another DateTime. Functions accepting a `DateInput`
 * normalize via `toDateTime()`.
 */
export type DateInput = string | number | Date | DateTimeLike

/**
 * Structural type for DateTime — used in pure modules that must avoid a
 * circular import on the DateTime class itself. Anything that walks like a
 * DateTime is treated as one.
 */
export interface DateTimeLike {
  clone(): DateTimeLike
  get(unit: Unit): number
  isUtc(): boolean
  isValid(): boolean
  toDate(): Date
  valueOf(): number
}

export interface DateObject {
  day?: number
  hour?: number
  millisecond?: number
  minute?: number
  month?: number
  second?: number
  year: number
}

export interface CreateOptions {
  /** Locale name to attach to this instance (overrides global default). */
  locale?: string
  /** Treat the input as a UTC instant rather than local-time. */
  utc?: boolean
}

// ── Comparison / range ──────────────────────────────────────────────────────

export type SortOrder = 'asc' | 'desc'
export type WeekStart = 'sunday' | 'monday' | 'saturday'

/** Boundary inclusivity for `isBetween`. */
export type Inclusivity = '()' | '[]' | '[)' | '(]'

export type RangeIterateUnit =
  'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'

export type GroupByUnit = 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour'
export type UniqueUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'

// ── Locale ──────────────────────────────────────────────────────────────────

export interface LocaleRelativeTime {
  d: string
  dd: string
  future: string
  h: string
  hh: string
  m: string
  M: string
  mm: string
  MM: string
  past: string
  s: string
  ss?: string
  y: string
  yy: string
}

export interface LocaleCalendar {
  lastDay?: string
  lastWeek?: string
  nextDay?: string
  nextWeek?: string
  sameDay?: string
  sameElse?: string
}

export interface LocaleLongDateFormats {
  L?: string
  l?: string
  LL?: string
  ll?: string
  LLL?: string
  lll?: string
  LLLL?: string
  llll?: string
  LT?: string
  LTS?: string
}

export interface LocaleData {
  calendar?: LocaleCalendar
  longDateFormat?: LocaleLongDateFormats
  meridiem?: (hour: number, minute: number, isLower: boolean) => string
  months?: string[]
  monthsShort?: string[]
  /** Locale code, e.g. "en", "fr", "ja". */
  name?: string
  ordinal?: (n: number) => string
  relativeTime?: LocaleRelativeTime
  weekdays?: string[]
  weekdaysMin?: string[]
  weekdaysShort?: string[]
  weekStart?: WeekStart
}

// ── Diff / age / countdown ──────────────────────────────────────────────────

export interface PreciseDiffResult {
  days: number
  hours: number
  /** "2 years, 3 months" */
  humanize(maxParts?: number): string
  milliseconds: number
  minutes: number
  months: number
  seconds: number
  years: number
}

export interface AgeResult {
  days: number
  months: number
  /** "32y 3mo 5d" */
  toString(): string
  years: number
}

export interface CountdownResult {
  days: number
  format(template: string): string
  hours: number
  humanize(): string
  isPast: boolean
  milliseconds: number
  minutes: number
  seconds: number
  /** Signed total ms — negative if target already passed. */
  total: number
}

// ── Calendar grid ───────────────────────────────────────────────────────────

export interface CalendarCell<D = DateTime> {
  date: D
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
}

export interface CalendarGridOptions {
  weekStart?: WeekStart
}

// ── Fiscal year ─────────────────────────────────────────────────────────────

export interface FiscalConfig {
  /** 1-12 — month the fiscal year begins. */
  startMonth: number
}

// ── Cron ────────────────────────────────────────────────────────────────────

export interface CronField {
  any: boolean
  values: Set<number>
}

// ── Holidays ────────────────────────────────────────────────────────────────

/** Countries with a registered holiday provider. */
export type HolidayCountry = 'US' | 'UK' | 'IN' | 'DE' | 'FR' | 'CA' | 'AU' | 'JP' | 'NP'

// ── Plugins / macros ────────────────────────────────────────────────────────

/**
 * A plugin receives the DateTime constructor and may register macros, locales,
 * or any other side effects. Plugins are called once at registration time.
 */
export type PluginFn<O = unknown> = (DT: typeof DateTime, options?: O) => void

/** A user-defined instance method. `this` is bound to the DateTime instance. */
export type MacroFn<A extends unknown[] = unknown[], R = unknown> = (
  this: DateTime,
  ...args: A
) => R

/** A user-defined static method. */
export type StaticMacroFn<A extends unknown[] = unknown[], R = unknown> = (...args: A) => R

/** Alias of {@link MacroFn}. */
export type Macro<A extends unknown[] = unknown[], R = unknown> = MacroFn<A, R>

/** Alias of {@link StaticMacroFn}. */
export type StaticMacro<A extends unknown[] = unknown[], R = unknown> = StaticMacroFn<A, R>

/**
 * Type-safe macro extension is done by augmenting the DateTime class
 * interface directly via TypeScript module augmentation:
 *
 * @example
 *   import type {} from '@anilkumarthakur/d8'
 *   declare module '@anilkumarthakur/d8' {
 *     interface DateTime {
 *       greet(): string
 *     }
 *   }
 *
 * No additional helper interface is needed — TypeScript merges your
 * declaration into the class's instance type, and any registered macro of
 * the same name is then statically typed.
 */
