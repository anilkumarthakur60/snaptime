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
  | 'week'
  | 'quarter'

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
    (input?: string | number | Date | DateFormat, opts?: { utc?: boolean }): DateFormat
    parse(str: string, fmt: string, strict?: boolean): DateFormat
    min(...args: (string | number | Date | DateFormat)[]): DateFormat
    max(...args: (string | number | Date | DateFormat)[]): DateFormat
    duration(n: number, unit: Unit): Duration
    locale(name: string, data?: LocaleData): void
    defineLocale(name: string, data: LocaleData): LocaleData
    updateLocale(name: string, data?: LocaleData | null): LocaleData | void
    localeData(name?: string): LocaleData
    use(plugin: PluginFn): typeof DateFormat
    isMoment(obj: any): obj is DateFormat
    isDate(obj: any): obj is Date
    normalizeUnits(unit: string): Unit | null
  }
  
/** Plugin function type */
export type PluginFn = (DF: typeof DateFormat, inst: typeof DateFormat) => void
