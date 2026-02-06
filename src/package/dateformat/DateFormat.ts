import type { Unit, LocaleData, PluginFn } from '../type'
import Duration from '../duration'
import { UNIT_MS } from '../utils/constants'
import { parseDateLike } from '../utils/parsers'
import { normalizeUnit, isDate } from '../utils/validators'
import { FormatEngine } from '../format/engine'
import { Comparisons } from './comparisons'
import { DateManipulation } from './manipulation'
import { DateQueries } from './queries'
import { RelativeTime } from './relative-time'

export interface DateFormatPluginMethods {
  testPluginMethod?: () => string
}

/** Main DateFormat class for date/time manipulation */
export default class DateFormat {
  private static _plugins: PluginFn[] = []
  private static _locales: Record<string, LocaleData> = {}
  private static _currentLocale: string | null = null

  private readonly _d: Date
  private readonly _utc: boolean

  constructor(
    input: string | number | Date | DateFormat = Date.now(),
    opts: { utc?: boolean } = {}
  ) {
    const { date, isUTC } = parseDateLike(input instanceof DateFormat ? input.valueOf() : input)

    this._d = new Date(date)
    this._utc = opts.utc ?? isUTC

    // Run registered plugins
    for (const p of DateFormat._plugins) {
      p(DateFormat, DateFormat)
    }
  }

  // ==================== Static API ====================

  static parse(str = '', fmt = '', strict = false): DateFormat {
    if (!fmt) {
      return new DateFormat(str, { utc: str.endsWith('Z') })
    }

    // Build regex from token patterns
    let pattern = fmt
    const tokenPatterns: Record<string, string> = {
      YYYY: '(\\d{4})',
      MM: '(\\d{1,2})',
      DD: '(\\d{1,2})',
      HH: '(\\d{1,2})',
      hh: '(\\d{1,2})',
      mm: '(\\d{1,2})',
      ss: '(\\d{1,2})',
      X: '(-?\\d+)',
      x: '(-?\\d+)',
      DDD: '(\\d{1,3})',
      DDDD: '(\\d{3})',
      Z: '([+-]\\d{2}:?\\d{2}|Z)'
    }

    for (const [tok, rx] of Object.entries(tokenPatterns)) {
      pattern = pattern.replace(new RegExp(tok, 'g'), rx)
    }

    const re = new RegExp(`^${pattern}$`)
    const m = re.exec(str)
    if (!m) {
      return new DateFormat(NaN)
    }

    const parts: Record<string, number | string> = {}
    const toks = fmt.match(/YYYY|MM|DD|HH|hh|mm|ss|X|x|DDD|DDDD|Z/g) || []
    toks.forEach((t, i) => {
      parts[t] = m[i + 1]
    })

    // Validation in strict mode
    if (strict) {
      const mm = parts.MM != null ? Number(parts.MM) : null
      if (mm !== null && (mm < 1 || mm > 12)) return new DateFormat(NaN)
      const dd = parts.DD != null ? Number(parts.DD) : null
      if (dd !== null) {
        const dim = new Date(Number(parts.YYYY || 1970), mm ?? 1, 0).getDate()
        if (dd < 1 || dd > dim) return new DateFormat(NaN)
      }
    }

    // Unix timestamps
    if (parts.x != null) {
      return new DateFormat(Number(parts.x), { utc: true })
    }
    if (parts.X != null) {
      return new DateFormat(Number(parts.X) * 1000, { utc: true })
    }

    const Y = Number(parts.YYYY || 1970)
    const Mo = Number(parts.MM || 1) - 1
    const D = Number(parts.DD || 1)
    const h = Number(parts.HH ?? parts.hh ?? 0)
    const mi = Number(parts.mm || 0)
    const s = Number(parts.ss || 0)

    const sawZ = parts.Z === 'Z'
    const sawOff = typeof parts.Z === 'string' && parts.Z !== 'Z' && parts.Z !== undefined
    const onlyDateTokens =
      !fmt.includes('H') && !fmt.includes('h') && !fmt.includes('m') && !fmt.includes('s')

    if (strict && onlyDateTokens && !sawOff && !sawZ) {
      return new DateFormat(new Date(Y, Mo, D, 0, 0, 0), { utc: false })
    }

    const baseUtcMs = Date.UTC(Y, Mo, D, h, mi, s)
    const inst = new DateFormat(baseUtcMs, { utc: sawZ || sawOff })

    if (sawOff) {
      const ofs = (parts.Z as string).replace(':', '')
      const sign = ofs[0] === '+' ? 1 : -1
      const hh2 = Number(ofs.substring(1, 3))
      const mm2 = Number(ofs.substring(3, 5))
      const offset = sign * (hh2 * 60 + mm2) * 60_000
      return new DateFormat(inst.valueOf() - offset, { utc: false })
    }

    return inst
  }

  static use(plugin: PluginFn): typeof DateFormat {
    DateFormat._plugins.push(plugin)
    plugin(DateFormat, DateFormat)
    return DateFormat
  }

  static min(...args: (string | number | Date | DateFormat)[]): DateFormat {
    return args.map((a) => new DateFormat(a)).reduce((a, b) => (a.isBefore(b) ? a : b))
  }

  static max(...args: (string | number | Date | DateFormat)[]): DateFormat {
    return args.map((a) => new DateFormat(a)).reduce((a, b) => (a.isAfter(b) ? a : b))
  }

  static duration(n: number, unit: Unit): Duration {
    const ms = UNIT_MS[unit] ?? 0
    return new Duration(n * ms)
  }

  static locale(name: string, data?: LocaleData): void {
    if (data) DateFormat._locales[name] = data
    DateFormat._currentLocale = name
  }

  static defineLocale(name: string, data: LocaleData): LocaleData {
    DateFormat._locales[name] = data
    return data
  }

  static updateLocale(name: string, data?: LocaleData): LocaleData | void {
    if (data === null) {
      delete DateFormat._locales[name]
      return
    }
    if (data) {
      DateFormat._locales[name] = { ...DateFormat._locales[name], ...data }
      DateFormat._currentLocale = name
      return DateFormat._locales[name]
    }
    return DateFormat._locales[name]
  }

  static localeData(name?: string): LocaleData {
    return DateFormat._locales[name || DateFormat._currentLocale || 'en'] || {}
  }

  static isMoment(obj: unknown): obj is DateFormat {
    return obj instanceof DateFormat
  }

  static isDate(obj: unknown): obj is Date {
    return isDate(obj)
  }

  static normalizeUnits(unit: string): Unit | null {
    const normalized = normalizeUnit(unit)
    return normalized === 'unknown' ? null : normalized
  }

  // ==================== Instance API ====================

  valueOf(): number {
    return this._d.getTime()
  }

  unix(): number {
    return Math.floor(this.valueOf() / 1000)
  }

  isValid(): boolean {
    return DateQueries.isValid(this._d)
  }

  isUtc(): boolean {
    return this._utc
  }

  isLocal(): boolean {
    return !this._utc
  }

  isDST(): boolean {
    if (this._utc) return false
    return DateQueries.isDST(this._d, this.get('year'))
  }

  get(u: Unit | 'day'): number {
    return DateManipulation.get(this._d, this._utc, u)
  }

  set(u: Unit, val: number): DateFormat {
    const inst = this.clone()
    const newDate = new Date(inst._d.getTime())
    DateManipulation.set(newDate, inst._utc, u, val)
    return new DateFormat(newDate, { utc: inst._utc })
  }

  add(n: number, unit: Unit): DateFormat {
    if (unit === 'month' || unit === 'year') {
      return this.set(unit, this.get(unit) + n)
    }
    const ms = DateManipulation.addMs(this.valueOf(), n, unit, false)
    return new DateFormat(ms, { utc: this._utc })
  }

  subtract(n: number, unit: Unit): DateFormat {
    return this.add(-n, unit)
  }

  // Comparison methods
  isBefore(o: string | number | Date | DateFormat): boolean {
    return Comparisons.isBefore(this.valueOf(), new DateFormat(o).valueOf())
  }

  isAfter(o: string | number | Date | DateFormat): boolean {
    return Comparisons.isAfter(this.valueOf(), new DateFormat(o).valueOf())
  }

  isSame(o: string | number | Date | DateFormat): boolean {
    return Comparisons.isSame(this.valueOf(), new DateFormat(o).valueOf())
  }

  isSameOrBefore(o: string | number | Date | DateFormat, unit?: Unit): boolean {
    const other = new DateFormat(o)
    if (unit) {
      return Comparisons.isSameOrBefore(
        this.valueOf(),
        other.valueOf(),
        unit,
        (v: number, u: Unit) => new DateFormat(v).startOf(u).valueOf()
      )
    }
    return Comparisons.isSameOrBefore(this.valueOf(), other.valueOf())
  }

  isSameOrAfter(o: string | number | Date | DateFormat, unit?: Unit): boolean {
    const other = new DateFormat(o)
    if (unit) {
      return Comparisons.isSameOrAfter(
        this.valueOf(),
        other.valueOf(),
        unit,
        (v: number, u: Unit) => new DateFormat(v).startOf(u).valueOf()
      )
    }
    return Comparisons.isSameOrAfter(this.valueOf(), other.valueOf())
  }

  isBetween(
    a: string | number | Date | DateFormat,
    b: string | number | Date | DateFormat,
    unit?: Unit,
    inclusivity?: string
  ): boolean {
    const A = new DateFormat(a).valueOf()
    const B = new DateFormat(b).valueOf()

    return Comparisons.isBetween(this.valueOf(), A, B, unit, inclusivity, (v: number, u: Unit) =>
      new DateFormat(v).startOf(u).valueOf()
    )
  }

  diff(
    other: DateFormat | Date | string | number,
    unit: Unit = 'millisecond',
    floating = false
  ): number {
    const o = other instanceof DateFormat ? other : new DateFormat(other as string | number | Date)
    return DateManipulation.diff(this.valueOf(), o.valueOf(), unit, floating)
  }

  toDate(): Date {
    return new Date(this.valueOf())
  }

  toISOString(): string {
    return this.toDate().toISOString()
  }

  toJSON(): string {
    return this.toISOString()
  }

  clone(): DateFormat {
    return new DateFormat(this, { utc: this._utc })
  }

  utc(): DateFormat {
    const c = this.clone()
    Object.defineProperty(c, '_utc', {
      value: true,
      writable: false,
      enumerable: true,
      configurable: true
    })
    return c
  }

  local(): DateFormat {
    if (!this._utc) return this.clone()
    return new DateFormat(this.valueOf())
  }

  daysInMonth(): number {
    return DateQueries.daysInMonth(this.get('year'), this.get('month'))
  }

  isLeapYear(): boolean {
    return DateQueries.isLeapYear(this.get('year'))
  }

  dayOfYear(): number {
    return DateQueries.dayOfYear(this._d, this._utc)
  }

  isoWeek(): number {
    return DateQueries.isoWeek(this._d, this._utc)
  }

  isoWeekYear(): number {
    return DateQueries.isoWeekYear(this._d, this._utc)
  }

  weeksInYear(): number {
    return DateQueries.weeksInYear(this.get('year'))
  }

  quarter(): number {
    return Math.ceil(this.get('month') / 3)
  }

  weekday(): number {
    return this.get('day')
  }

  isSunday(): boolean {
    return this.get('day') === 0
  }

  isMonday(): boolean {
    return this.get('day') === 1
  }

  isTuesday(): boolean {
    return this.get('day') === 2
  }

  isWednesday(): boolean {
    return this.get('day') === 3
  }

  isThursday(): boolean {
    return this.get('day') === 4
  }

  isFriday(): boolean {
    return this.get('day') === 5
  }

  isSaturday(): boolean {
    return this.get('day') === 6
  }

  isSameHour(other: string | number | Date | DateFormat): boolean {
    const o = new DateFormat(other)
    return this.isSameDay(o) && this.get('hour') === o.get('hour')
  }

  isCurrentHour(): boolean {
    return this.isSameHour(new DateFormat())
  }

  isNextHour(): boolean {
    return this.isSameHour(new DateFormat().add(1, 'hour'))
  }

  isLastHour(): boolean {
    return this.isSameHour(new DateFormat().subtract(1, 'hour'))
  }

  isSameMinute(other: string | number | Date | DateFormat): boolean {
    const o = new DateFormat(other)
    return this.isSameHour(o) && this.get('minute') === o.get('minute')
  }

  isCurrentMinute(): boolean {
    return this.isSameMinute(new DateFormat())
  }

  isNextMinute(): boolean {
    return this.isSameMinute(new DateFormat().add(1, 'minute'))
  }

  isLastMinute(): boolean {
    return this.isSameMinute(new DateFormat().subtract(1, 'minute'))
  }

  isSameSecond(other: string | number | Date | DateFormat): boolean {
    const o = new DateFormat(other)
    return this.isSameMinute(o) && this.get('second') === o.get('second')
  }

  isCurrentSecond(): boolean {
    return this.isSameSecond(new DateFormat())
  }

  isNextSecond(): boolean {
    return this.isSameSecond(new DateFormat().add(1, 'second'))
  }

  isLastSecond(): boolean {
    return this.isSameSecond(new DateFormat().subtract(1, 'second'))
  }

  isSameMillisecond(other: string | number | Date | DateFormat): boolean {
    return this.valueOf() === new DateFormat(other).valueOf()
  }

  isCurrentMillisecond(): boolean {
    return this.isSameMillisecond(new DateFormat())
  }

  isNextMillisecond(): boolean {
    return this.isSameMillisecond(new DateFormat().add(1, 'millisecond'))
  }

  isLastMillisecond(): boolean {
    return this.isSameMillisecond(new DateFormat().subtract(1, 'millisecond'))
  }

  isSameMicro(other: string | number | Date | DateFormat): boolean {
    return this.isSameMillisecond(other)
  }

  isCurrentMicro(): boolean {
    return this.isCurrentMillisecond()
  }

  isNextMicro(): boolean {
    return this.isNextMillisecond()
  }

  isLastMicro(): boolean {
    return this.isLastMillisecond()
  }

  isSameMicrosecond(other: string | number | Date | DateFormat): boolean {
    return this.isSameMillisecond(other)
  }

  isCurrentMicrosecond(): boolean {
    return this.isCurrentMillisecond()
  }

  isNextMicrosecond(): boolean {
    return this.isNextMillisecond()
  }

  isLastMicrosecond(): boolean {
    return this.isLastMillisecond()
  }

  isSameDecade(other: string | number | Date | DateFormat): boolean {
    const o = new DateFormat(other)
    return Math.floor(this.get('year') / 10) === Math.floor(o.get('year') / 10)
  }

  isCurrentDecade(): boolean {
    return Math.floor(this.get('year') / 10) === Math.floor(new DateFormat().get('year') / 10)
  }

  isNextDecade(): boolean {
    return Math.floor(this.get('year') / 10) === Math.floor(new DateFormat().get('year') / 10) + 1
  }

  isLastDecade(): boolean {
    return Math.floor(this.get('year') / 10) === Math.floor(new DateFormat().get('year') / 10) - 1
  }

  isSameCentury(other: string | number | Date | DateFormat): boolean {
    const o = new DateFormat(other)
    return Math.floor(this.get('year') / 100) === Math.floor(o.get('year') / 100)
  }

  isCurrentCentury(): boolean {
    return Math.floor(this.get('year') / 100) === Math.floor(new DateFormat().get('year') / 100)
  }

  isNextCentury(): boolean {
    return Math.floor(this.get('year') / 100) === Math.floor(new DateFormat().get('year') / 100) + 1
  }

  isLastCentury(): boolean {
    return Math.floor(this.get('year') / 100) === Math.floor(new DateFormat().get('year') / 100) - 1
  }

  isSameMillennium(other: string | number | Date | DateFormat): boolean {
    const o = new DateFormat(other)
    return Math.floor(this.get('year') / 1000) === Math.floor(o.get('year') / 1000)
  }

  isCurrentMillennium(): boolean {
    return Math.floor(this.get('year') / 1000) === Math.floor(new DateFormat().get('year') / 1000)
  }

  isNextMillennium(): boolean {
    return (
      Math.floor(this.get('year') / 1000) === Math.floor(new DateFormat().get('year') / 1000) + 1
    )
  }

  isLastMillennium(): boolean {
    return (
      Math.floor(this.get('year') / 1000) === Math.floor(new DateFormat().get('year') / 1000) - 1
    )
  }

  // Same day/week/month/year predicates
  isSameYear(other: string | number | Date | DateFormat): boolean {
    return this.get('year') === new DateFormat(other).get('year')
  }

  isCurrentYear(): boolean {
    return this.get('year') === new DateFormat().get('year')
  }

  isNextYear(): boolean {
    return this.get('year') === new DateFormat().get('year') + 1
  }

  isLastYear(): boolean {
    return this.get('year') === new DateFormat().get('year') - 1
  }

  isCurrentMonth(): boolean {
    const now = new DateFormat()
    return this.get('year') === now.get('year') && this.get('month') === now.get('month')
  }

  isNextMonth(): boolean {
    const now = new DateFormat()
    const next = now.add(1, 'month')
    return this.get('year') === next.get('year') && this.get('month') === next.get('month')
  }

  isLastMonth(): boolean {
    const now = new DateFormat()
    const last = now.subtract(1, 'month')
    return this.get('year') === last.get('year') && this.get('month') === last.get('month')
  }

  isSameWeek(other: string | number | Date | DateFormat): boolean {
    const o = new DateFormat(other)
    return this.isoWeek() === o.isoWeek() && this.get('year') === o.get('year')
  }

  isCurrentWeek(): boolean {
    const now = new DateFormat()
    return this.isoWeek() === now.isoWeek() && this.get('year') === now.get('year')
  }

  isNextWeek(): boolean {
    const now = new DateFormat()
    const next = now.add(1, 'week')
    return this.isoWeek() === next.isoWeek() && this.get('year') === next.get('year')
  }

  isLastWeek(): boolean {
    const now = new DateFormat()
    const last = now.subtract(1, 'week')
    return this.isoWeek() === last.isoWeek() && this.get('year') === last.get('year')
  }

  isSameDay(other: string | number | Date | DateFormat): boolean {
    const o = new DateFormat(other)
    return (
      this.get('year') === o.get('year') &&
      this.get('month') === o.get('month') &&
      this.get('date') === o.get('date')
    )
  }

  isCurrentDay(): boolean {
    return this.isSameDay(new DateFormat())
  }

  isNextDay(): boolean {
    return this.isSameDay(new DateFormat().add(1, 'day'))
  }

  isLastDay(): boolean {
    return this.isSameDay(new DateFormat().subtract(1, 'day'))
  }

  isCurrentQuarter(): boolean {
    const now = new DateFormat()
    return (
      this.get('year') === now.get('year') &&
      Math.ceil(this.get('month') / 3) === Math.ceil(now.get('month') / 3)
    )
  }

  isNextQuarter(): boolean {
    const now = new DateFormat()
    const next = now.add(3, 'month')
    return (
      this.get('year') === next.get('year') &&
      Math.ceil(this.get('month') / 3) === Math.ceil(next.get('month') / 3)
    )
  }

  isLastQuarter(): boolean {
    const now = new DateFormat()
    const last = now.subtract(3, 'month')
    return (
      this.get('year') === last.get('year') &&
      Math.ceil(this.get('month') / 3) === Math.ceil(last.get('month') / 3)
    )
  }

  format(fmt = 'YYYY-MM-DD hh:mm A'): string {
    if (!this.isValid()) {
      return 'Invalid Date'
    }
    return FormatEngine.format(this._d, fmt, this._utc)
  }

  formatIntl(opts: Intl.DateTimeFormatOptions = {}): string {
    const loc = DateFormat._currentLocale || undefined
    const formatter = new Intl.DateTimeFormat(loc, {
      ...opts,
      timeZone: this._utc ? 'UTC' : undefined
    })
    return formatter.format(this.toDate())
  }

  // Relative time methods
  fromNow(): string {
    return RelativeTime.fromNow(this.valueOf())
  }

  from(other: string | number | Date | DateFormat, withoutSuffix = false): string {
    return RelativeTime.from(this.valueOf(), new DateFormat(other).valueOf(), withoutSuffix)
  }

  to(other: string | number | Date | DateFormat, withoutSuffix = false): string {
    return RelativeTime.to(this.valueOf(), new DateFormat(other).valueOf(), withoutSuffix)
  }

  toNow(withoutSuffix = false): string {
    return RelativeTime.toNow(this.valueOf(), withoutSuffix)
  }

  calendar(): string {
    const today0 = new DateFormat().startOf('day').valueOf()
    const diff = this.valueOf() - today0
    const D = 864e5
    const T = this.format('hh:mm A')
    if (diff >= 0 && diff < D) return `Today at ${T}`
    else if (diff < 0 && diff > -D) return `Yesterday at ${T}`
    else if (diff >= D && diff < 2 * D) return `Tomorrow at ${T}`
    return this.format('YYYY-MM-DD')
  }

  startOf(u: Unit | 'week' | 'quarter'): DateFormat {
    const d = this.clone()
    switch (u) {
      case 'year':
        return d.set('month', 1).set('date', 1).startOf('day')
      case 'month':
        return d.set('date', 1).startOf('day')
      case 'week': {
        const day = d.get('day')
        return d.subtract(day, 'day').startOf('day')
      }
      case 'quarter': {
        const m = d.get('month')
        return d.set('month', Math.floor((m - 1) / 3) * 3 + 1).startOf('month')
      }
      case 'day':
        return d.set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0)
      case 'hour':
        return d.set('minute', 0).set('second', 0).set('millisecond', 0)
      case 'minute':
        return d.set('second', 0).set('millisecond', 0)
      case 'second':
        return d.set('millisecond', 0)
      default:
        return d
    }
  }

  endOf(u: Unit | 'week' | 'quarter'): DateFormat {
    return this.startOf(u)
      .add(1, u as Unit)
      .subtract(1, 'millisecond')
  }

  toObject(): {
    year: number
    month: number
    date: number
    hour: number
    minute: number
    second: number
    millisecond: number
  } {
    return {
      year: this.get('year'),
      month: this.get('month'),
      date: this.get('date'),
      hour: this.get('hour'),
      minute: this.get('minute'),
      second: this.get('second'),
      millisecond: this.get('millisecond')
    }
  }
}
