import type { Unit, LocaleData, PluginFn } from './type'
import Duration from './Duration'

// Interface for custom plugin methods
export interface DateFormatPluginMethods {
  testPluginMethod?: () => string
}

export default class DateFormat {
  private static _plugins: PluginFn[] = []
  private static _locales: Record<string, LocaleData> = {}
  private static _currentLocale: string | null = null
  /** ms per unit (approx for month/year) */
  private static readonly UNIT_MS: Record<Unit, number> = {
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
    week: 6048e5 // 7 days
  }
  /** Token → regex for parsing */
  private static readonly TOK_RE: Record<string, string> = {
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
  private readonly _d: Date
  private readonly _utc: boolean

  constructor(
    input: string | number | Date | DateFormat = Date.now(),
    opts: { utc?: boolean } = {}
  ) {
    let isUtc = opts.utc ?? false
    let adjustedInput: string | number | Date | DateFormat = input

    // Regex for ISO8601 strings without timezone (e.g. "2025-05-04T12:34:56" or with fractional seconds)
    const ISO_WITHOUT_TZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/

    // If a plain ISO string comes in, treat it as UTC for consistency
    if (typeof input === 'string') {
      if (input.endsWith('Z')) {
        isUtc = true
        adjustedInput = input.slice(0, -1)
      } else if (ISO_WITHOUT_TZ.test(input)) {
        isUtc = true
        // leave adjustedInput as the full string
      }
    }

    // 1) Cloning an existing DateFormat
    if (adjustedInput instanceof DateFormat) {
      this._d = new Date(adjustedInput.valueOf())
      this._utc = adjustedInput._utc

      // 2) Cloning a native Date
    } else if (adjustedInput instanceof Date) {
      this._d = new Date(adjustedInput.getTime())
      this._utc = isUtc

      // 3) Numeric timestamp (ms since epoch)
    } else if (typeof adjustedInput === 'number') {
      this._d = new Date(adjustedInput)
      this._utc = isUtc

      // 4) String input (may include +HH:mm offsets, or local format)
    } else {
      if (isUtc && ISO_WITHOUT_TZ.test(adjustedInput)) {
        // pure ISO date-time with no TZ ⇒ append 'Z' to force UTC parsing
        this._d = new Date(adjustedInput + 'Z')
      } else {
        // let JS Date handle offsets or local strings
        this._d = new Date(adjustedInput)
      }
      this._utc = isUtc
    }

    // Apply any loaded plugins
    for (const plugin of DateFormat._plugins) {
      plugin(DateFormat, DateFormat)
    }
  }

  // Static API

  /**
   * Parse a string according to a format string.
   * @param str    The input string
   * @param fmt    The format tokens, e.g. 'YYYY-MM-DD'
   * @param strict If true, will validate MM/DD bounds and treat date-only as local
   */
  static parse(str = '', fmt = '', strict = false): DateFormat {
    // If no custom format, fall back to the constructor’s parsing logic:
    if (!fmt) {
      return new DateFormat(str, { utc: str.endsWith('Z') })
    }

    // 1) Build a regex from TOK_RE
    let pattern = fmt
    for (const [tok, rx] of Object.entries(DateFormat.TOK_RE)) {
      pattern = pattern.replace(new RegExp(tok, 'g'), rx)
    }
    const re = new RegExp(`^${pattern}$`)
    const m = re.exec(str)
    if (!m) {
      // failed to even match
      return new DateFormat(NaN)
    }

    // 2) Extract the matched parts
    const parts: Record<string, number | string> = {}
    const toks = fmt.match(/YYYY|MM|DD|HH|hh|mm|ss|X|x|DDD|DDDD|Z/g) || []
    toks.forEach((t, i) => {
      parts[t] = m[i + 1]
    })

    // 3) Strict numeric bounds checking for MM/DD
    if (strict) {
      const mm = parts.MM != null ? Number(parts.MM) : null
      if (mm !== null && (mm < 1 || mm > 12)) return new DateFormat(NaN)
      const dd = parts.DD != null ? Number(parts.DD) : null
      if (dd !== null) {
        // days in month for that year/month
        const dim = new Date(Number(parts.YYYY || 1970), mm ?? 1, 0).getDate()
        if (dd < 1 || dd > dim) return new DateFormat(NaN)
      }
    }

    // 4) Unix timestamps short-circuit
    if (parts.x != null) {
      return new DateFormat(Number(parts.x), { utc: true })
    }
    if (parts.X != null) {
      return new DateFormat(Number(parts.X) * 1000, { utc: true })
    }

    // 5) Build the date components
    const Y = Number(parts.YYYY || 1970)
    const Mo = Number(parts.MM || 1) - 1
    const D = Number(parts.DD || 1)
    const h = Number(parts.HH ?? parts.hh ?? 0)
    const mi = Number(parts.mm || 0)
    const s = Number(parts.ss || 0)

    // Does the input explicitly carry a Z or ±HH:mm?
    const sawZ = parts.Z === 'Z'
    const sawOff = typeof parts.Z === 'string' && parts.Z !== 'Z' && parts.Z !== undefined

    // 6) If strict _and_ it's a pure date (no HH/mm/ss tokens), parse as local midnight:
    //    so that format('YYYY-MM-DD') always yields the same day everywhere.
    const onlyDateTokens =
      !fmt.includes('H') && !fmt.includes('h') && !fmt.includes('m') && !fmt.includes('s')
    if (strict && onlyDateTokens && !sawOff && !sawZ) {
      // Local midnight constructor:
      return new DateFormat(new Date(Y, Mo, D, 0, 0, 0), { utc: false })
    }

    // 7) Otherwise, parse as UTC, and then adjust for any explicit offset
    //    (we’ll let the Date.UTC + manual offset logic handle that).
    const baseUtcMs = Date.UTC(Y, Mo, D, h, mi, s)
    const inst = new DateFormat(baseUtcMs, { utc: sawZ || sawOff })

    if (sawOff) {
      // e.g. "+05:45" → "+0545"
      const ofs = (parts.Z as string).replace(':', '')
      const sign = ofs[0] === '+' ? 1 : -1
      const hh2 = Number(ofs.substring(1, 3))
      const mm2 = Number(ofs.substring(3, 5))
      const offset = sign * (hh2 * 60 + mm2) * 60_000
      // subtract that offset to get the correct UTC instant
      return new DateFormat(inst.valueOf() - offset, { utc: false })
    }

    // 8) Finally, return the instance (in UTC mode if we saw a 'Z', else local)
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
    const ms = DateFormat.UNIT_MS[unit] ?? 0
    return new Duration(n * ms)
  }

  static locale(name: string, data?: LocaleData): void {
    if (data) DateFormat._locales[name] = data
    DateFormat._currentLocale = name
  }

  // Instance API

  valueOf(): number {
    return this._d.getTime()
  }

  unix(): number {
    return Math.floor(this.valueOf() / 1000)
  }

  isValid(): boolean {
    return !isNaN(this._d.getTime())
  }

  isUtc(): boolean {
    return this._utc
  }

  isLocal(): boolean {
    return !this._utc
  }

  isDST(): boolean {
    if (this._utc) return false
    const jan = new Date(this.get('year'), 0, 1).getTimezoneOffset()
    const jul = new Date(this.get('year'), 6, 1).getTimezoneOffset()
    return Math.min(jan, jul) === this._d.getTimezoneOffset()
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

  isSameYear(other: string | number | Date | DateFormat): boolean {
    const o = new DateFormat(other)
    return this.get('year') === o.get('year')
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

  // Microsecond methods aliased to millisecond due to JS Date limitations
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

  diff(
    other: DateFormat | Date | string | number,
    unit: Unit = 'millisecond',
    floating = false
  ): number {
    const o = other instanceof DateFormat ? other : new DateFormat(other as string | number | Date)
    const ms = this.valueOf() - o.valueOf()
    const per = DateFormat.UNIT_MS[unit] || 1

    if (per === 0) {
      throw new Error(`Invalid unit "${unit}"`)
    }

    const result = ms / per
    if (floating) {
      return Math.round((result + Number.EPSILON) * 100) / 100
    }
    return Math[result < 0 ? 'ceil' : 'floor'](result)
  }

  toDate(): Date {
    return new Date(this.valueOf())
  }

  toISOString(): string {
    return new Date(this.valueOf()).toISOString()
  }

  toJSON(): string {
    return this.toISOString()
  }

  clone(): DateFormat {
    return new DateFormat(this, { utc: this._utc })
  }

  get(u: Unit | 'day'): number {
    const p = this._utc ? 'getUTC' : 'get'
    let method = ''

    switch (u) {
      case 'year':
        method = `${p}FullYear`
        break
      case 'month':
        method = `${p}Month`
        break
      case 'date':
        method = `${p}Date`
        break
      case 'day':
        method = `${p}Day`
        break
      case 'hour':
        method = `${p}Hours`
        break
      case 'minute':
        method = `${p}Minutes`
        break
      case 'second':
        method = `${p}Seconds`
        break
      case 'millisecond':
        method = `${p}Milliseconds`
        break
      default:
        throw new Error(`Unknown unit "${u}"`)
    }

    type DateGetter = keyof Pick<
      Date,
      | 'getFullYear'
      | 'getMonth'
      | 'getDate'
      | 'getDay'
      | 'getHours'
      | 'getMinutes'
      | 'getSeconds'
      | 'getMilliseconds'
      | 'getUTCFullYear'
      | 'getUTCMonth'
      | 'getUTCDate'
      | 'getUTCDay'
      | 'getUTCHours'
      | 'getUTCMinutes'
      | 'getUTCSeconds'
      | 'getUTCMilliseconds'
    >
    const fn = this._d[method as DateGetter]
    const val = fn.call(this._d)
    return u === 'month' ? val + 1 : val
  }

  set(u: Unit, val: number): DateFormat {
    const inst = this.clone()
    const p = inst._utc ? 'setUTC' : 'set'
    let method = ''

    switch (u) {
      case 'year':
        method = `${p}FullYear`
        break
      case 'month':
        method = `${p}Month`
        break
      case 'date':
        method = `${p}Date`
        break
      case 'hour':
        method = `${p}Hours`
        break
      case 'minute':
        method = `${p}Minutes`
        break
      case 'second':
        method = `${p}Seconds`
        break
      case 'millisecond':
        method = `${p}Milliseconds`
        break
      default:
        throw new Error(`Unknown unit "${u}"`)
    }

    type DateSetter = keyof Pick<
      Date,
      | 'setFullYear'
      | 'setMonth'
      | 'setDate'
      | 'setHours'
      | 'setMinutes'
      | 'setSeconds'
      | 'setMilliseconds'
      | 'setUTCFullYear'
      | 'setUTCMonth'
      | 'setUTCDate'
      | 'setUTCHours'
      | 'setUTCMinutes'
      | 'setUTCSeconds'
      | 'setUTCMilliseconds'
    >
    const fn = inst._d[method as DateSetter]
    fn.call(inst._d, u === 'month' ? val - 1 : val)
    return inst
  }

  add(n: number, unit: Unit): DateFormat {
    if (unit === 'month' || unit === 'year') {
      return this.set(unit, this.get(unit) + n)
    }

    const ms = DateFormat.UNIT_MS[unit]
    if (isNaN(ms)) {
      throw new Error(`Unknown unit "${unit}"`)
    }

    return new DateFormat(this.valueOf() + n * ms, { utc: this._utc })
  }

  subtract(n: number, unit: Unit): DateFormat {
    return this.add(-n, unit)
  }

  isBefore(o: string | number | Date | DateFormat): boolean {
    return this.valueOf() < new DateFormat(o as string | number | Date).valueOf()
  }

  isAfter(o: string | number | Date | DateFormat): boolean {
    return this.valueOf() > new DateFormat(o as string | number | Date).valueOf()
  }

  isSame(o: string | number | Date | DateFormat): boolean {
    return this.valueOf() === new DateFormat(o as string | number | Date).valueOf()
  }

  isBetween(
    a: string | number | Date | DateFormat,
    b: string | number | Date | DateFormat
  ): boolean {
    const t = this.valueOf()
    const A = new DateFormat(a as string | number | Date).valueOf()
    const B = new DateFormat(b as string | number | Date).valueOf()
    return t > A && t < B
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
    const ts = this.valueOf()
    const localDate = new Date(ts)
    return new DateFormat(localDate)
  }

  daysInMonth(): number {
    const Y = this.get('year'),
      M = this.get('month')
    return new Date(Y, M, 0).getDate()
  }

  isLeapYear(): boolean {
    const y = this.get('year')
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
  }

  dayOfYear(): number {
    const start = DateFormat.parse(`${this.get('year')}-01-01`, 'YYYY-MM-DD', true)
    return Math.floor((this.valueOf() - start.valueOf()) / 864e5) + 1
  }

  weekday(): number {
    return this.get('day')
  }

  format(fmt = 'YYYY-MM-DD hh:mm A'): string {
    if (!this.isValid()) {
      return 'Invalid Date'
    }

    const Y = String(this.get('year'))
    const M = this.get('month')
    const D = this.get('date')
    const H = this.get('hour')
    const m = this.get('minute')
    const s = this.get('second')
    const day = this.get('day')
    const timestampMs = this.toDate().getTime()
    const timestampSec = Math.floor(timestampMs / 1000)
    const doy = this.dayOfYear()
    const week = this.isoWeek()

    const offsetMin = -this._d.getTimezoneOffset()
    const sign = offsetMin >= 0 ? '+' : '-'
    const absMin = Math.abs(offsetMin)
    const offH = String(Math.floor(absMin / 60)).padStart(2, '0')
    const offM = String(absMin % 60).padStart(2, '0')
    const Z = `${sign}${offH}:${offM}`
    const ZZ = Z.replace(':', '')

    const L = DateFormat._locales[DateFormat._currentLocale || 'en'] || {}
    const months = L.months || [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    const monthsShort = L.monthsShort || [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    const weekdays = L.weekdays || [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ]
    const weekdaysShort = L.weekdaysShort || weekdays.map((w) => w.slice(0, 3))
    const weekdaysMin = L.weekdaysMin || weekdays.map((w) => w.slice(0, 2))

    const ord = (n: number) => {
      const k = n % 100
      const j = n % 10
      if (j === 1 && k !== 11) return `${n}st`
      if (j === 2 && k !== 12) return `${n}nd`
      if (j === 3 && k !== 13) return `${n}rd`
      return `${n}th`
    }

    const tokenMap: Record<string, string> = {
      YYYY: Y,
      YY: Y.slice(-2),
      Q: String(Math.ceil(M / 3)),
      gg: String(this.isoWeekYear()),
      Mo: ord(M),
      MMMM: months[M - 1] || String(M),
      MMM: monthsShort[M - 1] || String(M),
      MM: String(M).padStart(2, '0'),
      M: String(M),
      DDDD: String(doy).padStart(3, '0'),
      DDD: String(doy),
      Do: ord(D),
      DD: String(D).padStart(2, '0'),
      D: String(D),
      WW: String(week).padStart(2, '0'),
      W: String(week),
      ZZ: ZZ,
      Z: Z,
      dddd: weekdays[day],
      ddd: weekdaysShort[day],
      dd: weekdaysMin[day],
      d: String(day),
      HH: String(H).padStart(2, '0'),
      H: String(H),
      hh: String(H % 12 || 12).padStart(2, '0'),
      h: String(H % 12 || 12),
      mm: String(m).padStart(2, '0'),
      m: String(m),
      ss: String(s).padStart(2, '0'),
      s: String(s),
      A: H < 12 ? 'AM' : 'PM',
      a: H < 12 ? 'am' : 'pm',
      X: String(timestampSec),
      x: String(timestampMs)
    }

    const tokens = Object.keys(tokenMap).sort((a, b) => b.length - a.length)

    let out = ''
    for (let i = 0; i < fmt.length; ) {
      let matched = false
      for (const t of tokens) {
        if (fmt.slice(i, i + t.length) === t) {
          out += tokenMap[t]
          i += t.length
          matched = true
          break
        }
      }
      if (!matched) {
        out += fmt[i++]
      }
    }

    return out
  }

  formatIntl(opts: Intl.DateTimeFormatOptions = {}): string {
    const loc = DateFormat._currentLocale || undefined
    const formatter = new Intl.DateTimeFormat(loc, {
      ...opts,
      timeZone: this._utc ? 'UTC' : undefined
    })

    if (opts.weekday === 'long' && opts.month === 'long' && opts.day === 'numeric') {
      const formatted = formatter.format(this.toDate())
      if (formatted.indexOf(',') === -1 && formatted.split(' ').length >= 3) {
        const parts = formatted.split(' ')
        return `${parts[0]}, ${parts.slice(1).join(' ')}`
      }
    }

    return formatter.format(this.toDate())
  }

  fromNow(): string {
    const now = new DateFormat()
    const diff = this.valueOf() - now.valueOf()
    const isNegative = diff < 0
    const absMs = Math.abs(diff)

    let value: number
    let unit: string

    if (absMs < 1000) {
      value = Math.round(absMs)
      unit = value === 1 ? 'millisecond' : 'milliseconds'
    } else if (absMs < 60000) {
      value = Math.round(absMs / 1000)
      unit = value === 1 ? 'second' : 'seconds'
    } else if (absMs < 3600000) {
      value = Math.round(absMs / 60000)
      unit = value === 1 ? 'minute' : 'minutes'
    } else if (absMs < 86400000) {
      value = Math.round(absMs / 3600000)
      unit = value === 1 ? 'hour' : 'hours'
    } else {
      value = Math.round(absMs / 86400000)
      unit = value === 1 ? 'day' : 'days'
    }

    return isNegative ? `${value} ${unit} ago` : `in ${value} ${unit}`
  }

  isoWeek(): number {
    const d = new Date(this._utc ? this.valueOf() : this.local().valueOf())
    d.setHours(0, 0, 0, 0)
    // Adjust to Thursday of the current week (ISO week starts Monday)
    d.setDate(d.getDate() + 3 - (d.getDay() || 7))
    const yearStart = new Date(d.getFullYear(), 0, 1)
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)

    // Handle edge cases for week 1 and 53
    if (week < 1) {
      return new DateFormat(new Date(d.getFullYear() - 1, 11, 31)).isoWeek()
    }
    if (week > 52) {
      const nextYearStart = new Date(d.getFullYear() + 1, 0, 1)
      if (d.getTime() >= nextYearStart.getTime()) {
        return 1
      }
    }

    return week
  }

  isoWeekYear(): number {
    const d = new Date(this._utc ? this.valueOf() : this.local().valueOf())
    d.setDate(d.getDate() + 3 - (d.getDay() || 7))
    return d.getFullYear()
  }

  week(): number {
    return this.isoWeek()
  }

  weeksInYear(): number {
    const lastDay = new Date(this.get('year'), 11, 31)
    return new DateFormat(lastDay).isoWeek() === 1 ? 52 : 53
  }

  calendar(): string {
    const today0 = new DateFormat().startOf('day').valueOf()
    const diff = this.valueOf() - today0
    const D = 864e5,
      T = this.format('hh:mm A')
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
  quarter(): number {
    return Math.ceil(this.get('month') / 3)
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
