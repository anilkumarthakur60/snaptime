import DateFormat from './DateFormat'
import Duration from './Duration'

/** Supported time units */
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

export interface LocaleData {
  months?: string[]
  monthsShort?: string[]
  weekdays?: string[]
  weekdaysShort?: string[]
  weekdaysMin?: string[]
  relativeTime?: {
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
  calendar?: {
    sameDay?: string
    nextDay?: string
    lastDay?: string
    nextWeek?: string
    lastWeek?: string
    sameElse?: string
  }
}

/** Static side of the factory */
export interface DateFormatStatic {
  new (input?: string | number | Date | DateFormat, opts?: { utc?: boolean }): DateFormat
  parse(str: string, fmt: string, strict?: boolean): DateFormat
  min(...args: (string | number | Date | DateFormat)[]): DateFormat
  max(...args: (string | number | Date | DateFormat)[]): DateFormat
  duration(n: number, unit: Unit): Duration
  locale(name: string, data?: LocaleData): void
  use(plugin: PluginFn): typeof DateFormat
}

/** Plugin function type */
export type PluginFn = (DF: typeof DateFormat, inst: typeof DateFormat) => void
