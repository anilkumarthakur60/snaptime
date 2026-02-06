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

/** Plugin function type */
export type PluginFn = (DF: any, inst: any) => void

/** Static side of the factory */
export interface DateFormatStatic {
  (input?: string | number | Date, opts?: { utc?: boolean }): any
  parse(str: string, fmt: string, strict?: boolean): any
  min(...args: (string | number | Date | any)[]): any
  max(...args: (string | number | Date | any)[]): any
  duration(n: number, unit: Unit): any
  locale(name: string, data?: LocaleData): void
  defineLocale(name: string, data: LocaleData): LocaleData
  updateLocale(name: string, data?: LocaleData | null): LocaleData | void
  localeData(name?: string): LocaleData
  use(plugin: PluginFn): any
  isMoment(obj: any): boolean
  isDate(obj: any): boolean
  normalizeUnits(unit: string): Unit | null
}
