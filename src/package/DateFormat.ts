// src/DateFormat.ts

/** Supported time units */
export type Unit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'date' | 'month' | 'year' | 'fortnight' | 'unknown';

/** Locale data shape */
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

// Interface for custom plugin methods
export interface DateFormatPluginMethods {
  testPluginMethod?: () => string;
}

/** A length of time with parse/add/subtract/humanize/format */
export class Duration {
  private _ms: number
  constructor(ms: number = 0) {
    this._ms = ms
  }

  static parse(input: string): Duration {
    const re = /(\d+(?:\.\d+)?)(ms|[YyMwdhms])/g
    let total = 0,
      m: RegExpExecArray | null
    while ((m = re.exec(input))) {
      const v = parseFloat(m[1])
      switch (m[2]) {
        case 'Y':
        case 'y':
          total += v * 365 * 24 * 3600 * 1000
          break
        case 'M':
          total += v * 30 * 24 * 3600 * 1000
          break
        case 'w':
          total += v * 7 * 24 * 3600 * 1000
          break
        case 'd':
          total += v * 24 * 3600 * 1000
          break
        case 'h':
          total += v * 3600 * 1000
          break
        case 'm':
          total += v * 60 * 1000
          break
        case 's':
          total += v * 1000
          break
        case 'ms':
          total += v
          break
      }
    }
    return new Duration(total)
  }

  as(unit: Unit): number {
    const map: Record<Unit, number> = {
      millisecond: 1,
      second: 1e3,
      minute: 6e4,
      hour: 36e5,
      day: 864e5,
      date: 864e5,
      month: 2592e6, // ~30 days
      year: 31536e6, // ~365 days
      fortnight: 1209.6e6, // 14 days
      unknown: NaN
    }
    return this._ms / (map[unit] ?? 1)
  }

  add(n: number, unit: Unit): Duration {
    const u0 = Duration.parse(`1${unit[0]}`)
    return new Duration(this._ms + n * u0._ms)
  }

  subtract(n: number, unit: Unit): Duration {
    return this.add(-n, unit)
  }

  humanize(short = true): string {
    const ms = Math.abs(this._ms)
    if (ms < 1000) return short ? `${Math.round(ms)}ms` : `${Math.round(ms)} milliseconds`
    const s = ms / 1000
    if (s < 60) return short ? `${Math.round(s)}s` : `${Math.round(s)} seconds`
    const m = s / 60
    if (m < 60) return short ? `${Math.round(m)}m` : `${Math.round(m)} minutes`
    const h = m / 60
    if (h < 24) return short ? `${Math.round(h)}h` : `${Math.round(h)} hours`
    const d = h / 24
    return short ? `${Math.round(d)}d` : `${Math.round(d)} days`
  }

  format(fmt: string): string {
    // unchanged...
    const ms = this._ms
    const H = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    const S = Math.floor(ms % 1000)

    return fmt
      .replace(/HH/g, String(H).padStart(2, '0'))
      .replace(/H(?!H)/g, String(H))
      .replace(/mm/g, String(m).padStart(2, '0'))
      .replace(/m(?!m)/g, String(m))
      .replace(/ss/g, String(s).padStart(2, '0'))
      .replace(/s(?!s)/g, String(s))
      .replace(/SSS/g, String(S).padStart(3, '0'))
  }
}

/** Plugin function type */
export type PluginFn = (DF: typeof DateFormat, inst: typeof DateFormat) => void

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
    unknown: NaN
  }
  /** Token → regex for parsing */
  private static readonly TOK_RE: Record<string, string> = {
    YYYY: '(\\d{4})',
    MM: '(\\d{1,2})',
    DD: '(\\d{1,2})',
    HH: '(\\d{1,2})', // ← support 24-hour two-digit
    hh: '(\\d{1,2})', // ← still support 12-hour two-digit
    mm: '(\\d{1,2})',
    ss: '(\\d{1,2})',
    X: '(-?\\d+)', // unix seconds
    x: '(-?\\d+)', // unix ms
    DDD: '(\\d{1,3})', // day of the year
    DDDD: '(\\d{3})',
    Z: '([+-]\\d{2}:?\\d{2})'
  }
  private readonly _d: Date
  private readonly _utc: boolean

  constructor(
    input: string | number | Date | DateFormat = Date.now(),
    opts: { utc?: boolean } = {}
  ) {
    // handle DateFormat
    if (input instanceof DateFormat) {
      this._d = new Date(input.valueOf())
      this._utc = input._utc
    } else if (input instanceof Date) {
      this._d = new Date(input.getTime())
      this._utc = !!opts.utc
    } else {
      this._d = new Date(input)
      this._utc = !!opts.utc
    }

    if (this._utc) {
      // shift so getUTC* matches an original wall-clock
      this._d = new Date(this._d.getTime() + this._d.getTimezoneOffset() * 60000)
    }

    // apply any plugins to an instance prototype
    for (const p of DateFormat._plugins) p(DateFormat, DateFormat)
  }

  // —————————————————————————————————————————————————————————————————————
  // Static API
  // —————————————————————————————————————————————————————————————————————

  /** Create via `DateFormat.parse(str, fmt, strict?)` */
  static parse(str = '', fmt = '', strict = false): DateFormat {
    // build a regex from the format string
    let pattern = fmt
    for (const [tok, rx] of Object.entries(DateFormat.TOK_RE)) {
      pattern = pattern.replace(new RegExp(tok, 'g'), rx)
    }
    const re = new RegExp(`^${pattern}$`)
    const m = re.exec(str)
    if (!m) return new DateFormat(NaN)

    // extract matched parts
    const parts: Record<string, number> = {}
    const toks = fmt.match(/YYYY|MM|DD|HH|hh|mm|ss|X|x|DDD|DDDD|Z/g) || []
    toks.forEach((t, i) => {
      parts[t] = Number(m[i + 1])
    })

    // strict bounds check if requested
    if (strict) {
      if (parts.MM && (parts.MM < 1 || parts.MM > 12)) return new DateFormat(NaN)
      if (parts.DD) {
        const dim = new Date(parts.YYYY || 1970, (parts.MM || 1) - 1, 0).getDate()
        if (parts.DD < 1 || parts.DD > dim) return new DateFormat(NaN)
      }
    }

    // build the DateFormat from parts
    if (parts.x != null) return new DateFormat(Number(parts.x), { utc: true })
    if (parts.X != null) return new DateFormat(parts.X * 1000, { utc: true })

    const Y = parts.YYYY || 1970
    const Mo = (parts.MM || 1) - 1  // Convert 1-12 to 0-11 for JS Date
    const D = parts.DD || 1
    const h = parts.HH ?? parts.hh ?? 0
    const mi = parts.mm || 0
    const s = parts.ss || 0
    
    // Create with the correct UTC option
    const inst = new DateFormat(new Date(Date.UTC(Y, Mo, D, h, mi, s)), { utc: true })
    
    // apply timezone offset if Z was parsed
    if (parts.Z) {
      const ofs = String(parts.Z).replace(':', '')
      const sign = ofs[0] === '+' ? 1 : -1
      const hh2 = Number(ofs.substring(1, 3))
      const mm2 = Number(ofs.substring(3, 5))
      const offset = sign * (hh2 * 60 + mm2) * 60000
      return new DateFormat(new Date(inst.valueOf() - offset))
    }
    
    return inst
  }

  /** Use a plugin */
  static use(plugin: PluginFn): typeof DateFormat {
    DateFormat._plugins.push(plugin)
    plugin(DateFormat, DateFormat)
    return DateFormat
  }

  /** Min of many */
  static min(...args: (string | number | Date | DateFormat)[]): DateFormat {
    return args.map((a) => new DateFormat(a)).reduce((a, b) => (a.isBefore(b) ? a : b))
  }

  /** Max of many */
  static max(...args: (string | number | Date | DateFormat)[]): DateFormat {
    return args.map((a) => new DateFormat(a)).reduce((a, b) => (a.isAfter(b) ? a : b))
  }

  /** Create a Duration */
  static duration(n: number, unit: Unit): Duration {
    const ms = DateFormat.UNIT_MS[unit] ?? 0
    return new Duration(n * ms)
  }

  /** Register or switch locale */
  static locale(name: string, data?: LocaleData): void {
    if (data) DateFormat._locales[name] = data
    DateFormat._currentLocale = name
  }

  // —————————————————————————————————————————————————————————————————————
  // Instance API
  // —————————————————————————————————————————————————————————————————————

  /** ms since epoch */
  valueOf(): number {
    return this._utc ? this._d.getTime() - this._d.getTimezoneOffset() * 60000 : this._d.getTime()
  }

  /** Unix seconds */
  unix(): number {
    return Math.floor(this.valueOf() / 1000)
  }

  /** Valid? */
  isValid(): boolean {
    return !isNaN(this._d.getTime())
  }

  /** Diff vs. other in unit, optionally float */
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
      return Math.round((result + Number.EPSILON) * 100) / 100 // Round to 2 decimal places
    }
    return Math[result < 0 ? 'ceil' : 'floor'](result)
  }

  /** Native Date */
  toDate(): Date {
    return new Date(this.valueOf())
  }

  /** ISO string */
  toISOString(): string {
    return new Date(this.valueOf()).toISOString()
  }

  /** JSON */
  toJSON(): string {
    return this.toISOString()
  }

  /** Clone */
  clone(): DateFormat {
    return new DateFormat(this, { utc: this._utc })
  }

  /** Get component */
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

  /** Set component (immutable) */
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

  /** Add n units */
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

  /** Subtract n units */
  subtract(n: number, unit: Unit): DateFormat {
    return this.add(-n, unit)
  }

  /** Comparisons */
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

  /** Toggle UTC/local */
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

  /** Days in the month */
  daysInMonth(): number {
    const Y = this.get('year'),
      M = this.get('month')
    return new Date(Y, M, 0).getDate()
  }

  /** Leap-year */
  isLeapYear(): boolean {
    const y = this.get('year')
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
  }

  /** Day of the year 1–366 */
  dayOfYear(): number {
    const start = DateFormat.parse(`${this.get('year')}-01-01`, 'YYYY-MM-DD', true)
    return Math.floor((this.valueOf() - start.valueOf()) / 864e5) + 1
  }

  /** Weekday 0–6 */
  weekday(): number {
    return this.get('day')
  }

  // —————————————————————————————————————————————————————————————————————
  // Formatting
  // —————————————————————————————————————————————————————————————————————
  /**
   * Format with tokens:
   * YYYY, YY, Q, Mo, MMMM, MMM,
   * DDDD, DDD, DD, Do, D,
   * WW, W,
   * Z, ZZ,
   * X, x,
   * hh, h, HH, H, mm, m, ss, s,
   * A, a,
   * dddd, ddd, dd, d
   */
  format(fmt = 'YYYY-MM-DD hh:mm A'): string {
    if (!this.isValid()) {
      return 'Invalid Date'
    }

    // precompute all values
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

    // offset string
    const offsetMin = -this._d.getTimezoneOffset()
    const sign = offsetMin >= 0 ? '+' : '-'
    const absMin = Math.abs(offsetMin)
    const offH = String(Math.floor(absMin / 60)).padStart(2, '0')
    const offM = String(absMin % 60).padStart(2, '0')
    const Z = `${sign}${offH}:${offM}`
    const ZZ = Z.replace(':', '')

    // locale fallbacks
    const L = DateFormat._locales.en || {}
    const months = L.months || [
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
    const monthsShort = L.monthsShort || months.slice(0, 3)
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

    // ordinal helper
    const ord = (n: number) => {
      const k = n % 100
      const j = n % 10
      if (j === 1 && k !== 11) return `${n}st`
      if (j === 2 && k !== 12) return `${n}nd`
      if (j === 3 && k !== 13) return `${n}rd`
      return `${n}th`
    }

    // build a map of token → its replacement
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

    // sort tokens by length descending so longer ones match first
    const tokens = Object.keys(tokenMap).sort((a, b) => b.length - a.length)

    // scan the fmt string, replacing tokens in one pass
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

  /** Intl-based formatting */
  formatIntl(opts: Intl.DateTimeFormatOptions = {}): string {
    const loc = DateFormat._currentLocale || undefined
    const formatter = new Intl.DateTimeFormat(loc, {
      ...opts,
      timeZone: this._utc ? 'UTC' : undefined
    })
    
    // Special handling for locale that needs commas
    if (opts.weekday === 'long' && opts.month === 'long' && opts.day === 'numeric') {
      // For formats like "Sunday, 4 May 2025"
      const formatted = formatter.format(this.toDate())
      if (formatted.indexOf(',') === -1 && formatted.split(' ').length >= 3) {
        const parts = formatted.split(' ')
        return `${parts[0]}, ${parts.slice(1).join(' ')}`
      }
    }
    
    return formatter.format(this.toDate())
  }

  /** Relative time */
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

  /** ISO week (1–53) */
  isoWeek(): number {
    const d = new Date(this.valueOf())
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 4 - (d.getDay() || 7))
    const yearStart = new Date(d.getFullYear(), 0, 1)
    const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    
    // Adjust for December weeks that may belong to next year
    if (week === 1 && d.getMonth() === 11) {
      return 53
    }
    
    // Adjust for January weeks that may belong to previous year
    if (d.getMonth() === 0 && d.getDate() <= 3 && week >= 52) {
      return 53
    }
    
    return week
  }

  /** ISO week-year */
  isoWeekYear(): number {
    const d = new Date(this.valueOf())
    d.setDate(d.getDate() + 4 - (d.getDay() || 7))
    return d.getFullYear()
  }

  /** Alias for isoWeek() */
  week(): number {
    return this.isoWeek()
  }

  /** Weeks in year */
  weeksInYear(): number {
    const lastDay = new Date(this.get('year'), 11, 31)
    const lastDayWeekDay = lastDay.getDay()
    // If last day is a Thu/Fri/Sat, year has 53 weeks
    return lastDayWeekDay === 4 || lastDayWeekDay === 5 || lastDayWeekDay === 6 ? 53 : 52
  }

  /** Calendar output */
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

  /** Start of unit */
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

  /** End of unit */
  endOf(u: Unit | 'week' | 'quarter'): DateFormat {
    return this.startOf(u)
      .add(1, u as Unit)
      .subtract(1, 'millisecond')
  }
}
