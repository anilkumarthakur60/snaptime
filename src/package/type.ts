// ─────────────────────────────────────────────────────────────────────────────
// Core time units
// ─────────────────────────────────────────────────────────────────────────────

/** All supported time units */
export type Unit =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'date'
  | 'month'
  | 'year'
  | 'fortnight'
  | 'unknown'
  | 'week'

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitive types
// ─────────────────────────────────────────────────────────────────────────────

export type SortOrder = 'asc' | 'desc'
export type WeekStart = 'sunday' | 'monday'

/** Units usable for range iteration and splitting */
export type RangeIterateUnit =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year'

/** Units usable for grouping a DateCollection */
export type GroupByUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'quarter'

/** Units usable for deduplicating a DateCollection */
export type UniqueUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'

/** Supported built-in holiday calendars */
export type HolidayCountry = 'US' | 'UK' | 'IN' | 'DE' | 'FR' | 'CA' | 'AU'

// ─────────────────────────────────────────────────────────────────────────────
// Locale
// ─────────────────────────────────────────────────────────────────────────────

export interface LocaleRelativeTime {
  future: string
  past: string
  s: string
  m: string
  mm: string
  h: string
  hh: string
  d: string
  dd: string
  M: string
  MM: string
  y: string
  yy: string
}

export interface LocaleCalendar {
  sameDay?: string
  nextDay?: string
  lastDay?: string
  nextWeek?: string
  lastWeek?: string
  sameElse?: string
}

export interface LocaleData {
  months?: string[]
  monthsShort?: string[]
  weekdays?: string[]
  weekdaysShort?: string[]
  weekdaysMin?: string[]
  relativeTime?: LocaleRelativeTime
  calendar?: LocaleCalendar
}

// ─────────────────────────────────────────────────────────────────────────────
// Plugin system
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Plugin installer function.
 * Receives the DateFormat class as both arguments (constructor & prototype host).
 * Use declaration merging on DateFormatPluginMethods to extend the type.
 */
export type PluginFn = (DF: unknown, inst: unknown) => void

/**
 * Extend this interface via declaration merging to add types for plugin methods.
 * @example
 * declare module '@anilkumarthakur/d8' {
 *   interface DateFormatPluginMethods { myMethod(): string }
 * }
 */
export interface DateFormatPluginMethods {
  testPluginMethod?: () => string
}

// ─────────────────────────────────────────────────────────────────────────────
// Diff / age
// ─────────────────────────────────────────────────────────────────────────────

export interface PreciseDiffResult {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
  /** Human-readable string, e.g. "2 years, 3 months" */
  humanize(): string
}

export interface AgeResult {
  years: number
  months: number
  days: number
  /** e.g. "2y 3mo 5d" */
  toString(): string
}

// ─────────────────────────────────────────────────────────────────────────────
// Countdown
// ─────────────────────────────────────────────────────────────────────────────

export interface CountdownResult {
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
  /** Signed total milliseconds (negative if already past) */
  total: number
  isPast: boolean
  /**
   * Replace tokens D, H, m, s (doubled = zero-padded) in a template.
   * e.g. `format('DD [days] HH:mm:ss')`
   */
  format(template: string): string
  humanize(): string
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar grid
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One cell in a month-view calendar grid.
 * D is DateFormat at runtime; generic to avoid circular imports in type.ts.
 */
export interface CalendarCell<D = unknown> {
  date: D
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
}

export interface CalendarGridOptions {
  weekStart?: WeekStart
}

// ─────────────────────────────────────────────────────────────────────────────
// Fiscal year
// ─────────────────────────────────────────────────────────────────────────────

export interface FiscalConfig {
  /** Month the fiscal year starts: 1–12 (default 1 = January) */
  startMonth: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Cron internals
// ─────────────────────────────────────────────────────────────────────────────

export interface CronField {
  values: Set<number>
  any: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory static interface  (DateFormat/Duration referenced by import in index.ts)
// ─────────────────────────────────────────────────────────────────────────────

export interface DateFormatStatic {
  (input?: string | number | Date | unknown, opts?: { utc?: boolean }): unknown
  parse(str: string, fmt: string, strict?: boolean): unknown
  min(...args: (string | number | Date | unknown)[]): unknown
  max(...args: (string | number | Date | unknown)[]): unknown
  duration(n: number, unit: Unit): unknown
  locale(name: string, data?: LocaleData): void
  use(plugin: PluginFn): unknown
}
