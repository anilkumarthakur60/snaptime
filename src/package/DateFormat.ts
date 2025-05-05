// src/DateFormat.ts

/** Supported time units */
export type Unit =
    | 'millisecond'
    | 'second'
    | 'minute'
    | 'hour'
    | 'day'
    | 'date'
    | 'month'
    | 'year';


    /** Locale data shape */
export interface LocaleData {
  months?: string[];
  monthsShort?: string[];
  weekdays?: string[];
  weekdaysShort?: string[];
  weekdaysMin?: string[];
  relativeTime?: {
    future: string;       // e.g. 'in %s'
    past: string;         // e.g. '%s ago'
    s: string;            // seconds
    m: string;            // a minute
    mm: string;           // %d minutes
    h: string;            // an hour
    hh: string;           // %d hours
    d: string;            // a day
    dd: string;           // %d days
    M: string;            // a month
    MM: string;           // %d months
    y: string;            // a year
    yy: string;           // %d years
  };
  calendar?: {
    sameDay?: string;
    nextDay?: string;
    lastDay?: string;
    nextWeek?: string;
    lastWeek?: string;
    sameElse?: string;
  };
}

/** Static side of DateFormat */
export interface DateFormatStatic {
  new(input?: string|number|Date|DateFormat, opts?: { utc?: boolean }): DateFormat;
  parse(str: string, fmt: string, strict?: boolean): DateFormat;
  min(...args: (string|number|Date|DateFormat)[]): DateFormat;
  max(...args: (string|number|Date|DateFormat)[]): DateFormat;
  duration(n: number, unit: Unit): Duration;
  locale(name: string, data?: LocaleData): void;
  use(plugin: PluginFn): typeof DateFormat;
}

/** A length of time, with parse/add/subtract/humanize/format */
export class Duration {
  private _ms: number;
  constructor(ms: number = 0) {
    this._ms = ms;
  }

  /** Parse e.g. "2h30m", "1d", "500ms" */
  static parse(input: string): Duration {
    const re = /(\d+(?:\.\d+)?)(ms|[YyMwdhms])/g;
    let total = 0, m: RegExpExecArray|null;
    while ((m = re.exec(input))) {
      const v = parseFloat(m[1]);
      switch (m[2]) {
        case 'Y': case 'y': total += v * 365*24*3600*1000; break;
        case 'M': total += v * 30*24*3600*1000; break;
        case 'w': total += v * 7*24*3600*1000; break;
        case 'd': total += v * 24*3600*1000; break;
        case 'h': total += v * 3600*1000; break;
        case 'm': total += v * 60*1000; break;
        case 's': total += v * 1000; break;
        case 'ms': total += v; break;
      }
    }
    return new Duration(total);
  }

  /** Total in a given unit */
  as(unit: Unit): number {
    const map: Record<Unit, number> = {
      millisecond: 1,
      second:      1000,
      minute:      60*1000,
      hour:        3600*1000,
      day:         24*3600*1000,
      date:        24*3600*1000,
      month:       NaN,
      year:        NaN,
    };
    return this._ms / (map[unit] ?? 1);
  }

  /** Add n units */
  add(n: number, unit: Unit): Duration {
    const u0 = Duration.parse(`1${unit[0]}`); // hack to get ms-per-unit
    return new Duration(this._ms + n * u0._ms);
  }

  /** Subtract n units */
  subtract(n: number, unit: Unit): Duration {
    return this.add(-n, unit);
  }

  /** Humanize to short ("5 m") or long ("5 minutes") */
  humanize(short = true): string {
    const ms = Math.abs(this._ms);
    if (ms < 1000) return short ? `${Math.round(ms)}ms` : `${Math.round(ms)} milliseconds`;
    const s = ms/1000; if (s < 60) return short ? `${Math.round(s)}s` : `${Math.round(s)} seconds`;
    const m = s/60;   if (m < 60) return short ? `${Math.round(m)}m` : `${Math.round(m)} minutes`;
    const h = m/60;   if (h < 24) return short ? `${Math.round(h)}h` : `${Math.round(h)} hours`;
    const d = h/24;   return short ? `${Math.round(d)}d` : `${Math.round(d)} days`;
  }

  /**
   * Format with tokens:
   *   HH, H, mm, m, ss, s, SSS
   */
  format(fmt: string): string {
    const ms = this._ms;
    const H  = Math.floor(ms / 3600000);
    const m  = Math.floor((ms % 3600000) / 60000);
    const s  = Math.floor((ms % 60000) / 1000);
    const S  = Math.floor(ms % 1000);

    return fmt
        .replace(/HH/g, String(H).padStart(2,'0'))
        .replace(/H(?!H)/g, String(H))
        .replace(/mm/g, String(m).padStart(2,'0'))
        .replace(/m(?!m)/g, String(m))
        .replace(/ss/g, String(s).padStart(2,'0'))
        .replace(/s(?!s)/g, String(s))
        .replace(/SSS/g, String(S).padStart(3,'0'));
  }
}

/** Type for Duration humanize units */
type HumanizeUnit = 's' | 'm' | 'h' | 'd';

/** Plugin function type */
export type PluginFn = (DF: typeof DateFormat, instance: typeof DateFormat) => void;

export default class DateFormat {
  private readonly _d: Date;
  private readonly _utc: boolean;
  private static _plugins: PluginFn[] = [];
  private static _locales: Record<string, LocaleData> = {};
  private static _currentLocale: string | null = null;

  /** ms per unit (approx for month/year) */
  private static readonly UNIT_MS: Record<Unit, number> = {
    millisecond: 1,
    second:      1e3,
    minute:      6e4,
    hour:        36e5,
    day:         864e5,
    date:        864e5,
    month:       NaN,
    year:        NaN,
  };

  /** Token → regex for parsing */
  private static readonly TOK_RE: Record<string,string> = {
    YYYY: '(\\d{4})',
    MM:   '(\\d{1,2})',
    DD:   '(\\d{1,2})',
    hh:   '(\\d{1,2})',
    mm:   '(\\d{1,2})',
    ss:   '(\\d{1,2})',
    X:    '(-?\\d+)',       // unix seconds
    x:    '(-?\\d+)',       // unix ms
    DDD:  '(\\d{1,3})',     // day of the year
    DDDD: '(\\d{3})',
    Z:    '([+-]\\d{2}:?\\d{2})',
  };

  constructor(
      input: string|number|Date|DateFormat = Date.now(),
      opts: { utc?: boolean } = {}
  ) {
    // handle DateFormat
    if (input instanceof DateFormat) {
      this._d   = new Date(input.valueOf());
      this._utc = input._utc;
    } else if (input instanceof Date) {
      this._d   = new Date(input.getTime());
      this._utc = !!opts.utc;
    } else {
      this._d   = new Date(input);
      this._utc = !!opts.utc;
    }

    if (this._utc) {
      // shift so getUTC* matches an original wall-clock
      this._d = new Date(this._d.getTime() + this._d.getTimezoneOffset()*60000);
    }

    // apply any plugins to an instance prototype
    for (const p of DateFormat._plugins) p(DateFormat, DateFormat);
  }

  // —————————————————————————————————————————————————————————————————————
  // Static API
  // —————————————————————————————————————————————————————————————————————

  /** Create via `DateFormat.parse(str, fmt, strict?)` */
  static parse(str = '', fmt = '', strict = false): DateFormat {
    let pattern = fmt;
    for (const [tok, rx] of Object.entries(DateFormat.TOK_RE)) {
      pattern = pattern.replace(new RegExp(tok, 'g'), rx);
    }
    const re = new RegExp(`^${pattern}$`);
    const m  = re.exec(str);
    if (!m) return new DateFormat(NaN);

    const parts: Record<string, number> = {};
    const toks = fmt.match(/YYYY|MM|DD|hh|mm|ss|X|x|DDD|DDDD|Z/g) || [];
    toks.forEach((t,i) => { parts[t] = Number(m[i+1]); });

    // strict bounds
    if (strict) {
      if (parts.MM && (parts.MM<1||parts.MM>12)) return new DateFormat(NaN as number);
      if (parts.DD) {
        const dim = new Date(parts.YYYY||1970, (parts.MM||1)-1,0).getDate();
        if (parts.DD<1||parts.DD>dim) return new DateFormat(NaN as number);
      }
    }

    // build date
    if (parts.x != null)   return new DateFormat(Number(parts.x));
    if (parts.X != null)   return new DateFormat(parts.X*1000);
    const Y = parts.YYYY||1970;
    const Mo= (parts.MM||1)-1;
    const D = parts.DD || 1;
    const h = parts.hh||0;
    const mi= parts.mm||0;
    const s = parts.ss||0;
    const inst = new DateFormat(new Date(Y,Mo,D,h,mi,s));
    // apply offset if Z
    if (parts.Z) {
      const ofs = String(parts.Z).replace(':', '');
      const sign = ofs[0] === '+' ? 1 : -1;
      const hh2 = Number(ofs.substr(1, 2));
      const mm2 = Number(ofs.substr(3, 2));
      return new DateFormat(new Date(inst._d.getTime() - sign * ((hh2 * 60 + mm2) * 60000)));
    }
    return inst;
  }

  /** Use a plugin */
  static use(plugin: PluginFn): typeof DateFormat {
    DateFormat._plugins.push(plugin);
    plugin(DateFormat, DateFormat);
    return DateFormat;
  }

  /** Min of many */
  static min(...args: (string|number|Date|DateFormat)[]): DateFormat {
    return args.map(a=>new DateFormat(a)).reduce((a,b)=>a.isBefore(b)?a:b);
  }

  /** Max of many */
  static max(...args: (string|number|Date|DateFormat)[]): DateFormat {
    return args.map(a=>new DateFormat(a)).reduce((a,b)=>a.isAfter(b)?a:b);
  }

  /** Create a Duration */
  static duration(n: number, unit: Unit): Duration {
    const ms = DateFormat.UNIT_MS[unit] ?? 0;
    return new Duration(n * ms);
  }

  /** Register or switch locale */
  static locale(name: string, data?: LocaleData): void {
    if (data) DateFormat._locales[name] = data;
    DateFormat._currentLocale = name;
  }

  // —————————————————————————————————————————————————————————————————————
  // Instance API
  // —————————————————————————————————————————————————————————————————————

  /** ms since epoch */
  valueOf(): number {
    return this._utc
        ? this._d.getTime() - this._d.getTimezoneOffset()*60000
        : this._d.getTime();
  }

  /** Unix seconds */
  unix(): number {
    return Math.floor(this.valueOf()/1000);
  }

  /** Valid? */
  isValid(): boolean {
    return !isNaN(this._d.getTime());
  }
  /** Diff vs. other in unit, optionally float */
  diff(other: DateFormat | Date | string | number, unit: Unit = 'millisecond', floating = false): number {
    const o = other instanceof DateFormat ? other : new DateFormat(other as string | number | Date);
    const ms = this.valueOf() - o.valueOf();
    const per = DateFormat.UNIT_MS[unit] || 1;

    if (per === 0) {
      throw new Error(`Invalid unit "${unit}"`);
    }

    const result = ms / per;
    if (floating) {
      return Math.round((result + Number.EPSILON) * 100) / 100; // Round to 2 decimal places
    }
    return Math[result < 0 ? 'ceil' : 'floor'](result);
  }

  /** Native Date */
  toDate(): Date {
    return new Date(this.valueOf());
  }

  /** ISO string */
  toISOString(): string {
    return new Date(this.valueOf()).toISOString();
  }

  /** JSON */
  toJSON(): string {
    return this.toISOString();
  }

  /** Clone */
  clone(): DateFormat {
    return new DateFormat(this, {utc: this._utc});
  }

  /** Get component */
  get(u: Unit|'day'): number {
    const p = this._utc ? 'getUTC' : 'get';
    let method = '';
    
    switch(u) {
      case 'year': method = `${p}FullYear`; break;
      case 'month': method = `${p}Month`; break;
      case 'date': method = `${p}Date`; break;
      case 'day': method = `${p}Day`; break;
      case 'hour': method = `${p}Hours`; break;
      case 'minute': method = `${p}Minutes`; break;
      case 'second': method = `${p}Seconds`; break;
      case 'millisecond': method = `${p}Milliseconds`; break;
      default: throw new Error(`Unknown unit "${u}"`);
    }

    type DateGetter = keyof Pick<Date, 'getFullYear' | 'getMonth' | 'getDate' | 'getDay' | 'getHours' | 'getMinutes' | 'getSeconds' | 'getMilliseconds' |
                                    'getUTCFullYear' | 'getUTCMonth' | 'getUTCDate' | 'getUTCDay' | 'getUTCHours' | 'getUTCMinutes' | 'getUTCSeconds' | 'getUTCMilliseconds'>;
    const fn = this._d[method as DateGetter];
    const val = fn.call(this._d);
    return u === 'month' ? val + 1 : val;
  }

  /** Set component (immutable) */
  set(u: Unit, val: number): DateFormat {
    const inst = this.clone();
    const p = inst._utc ? 'setUTC' : 'set';
    let method = '';
    
    switch(u) {
      case 'year': method = `${p}FullYear`; break;
      case 'month': method = `${p}Month`; break;
      case 'date': method = `${p}Date`; break;
      case 'hour': method = `${p}Hours`; break;
      case 'minute': method = `${p}Minutes`; break;
      case 'second': method = `${p}Seconds`; break;
      case 'millisecond': method = `${p}Milliseconds`; break;
      default: throw new Error(`Unknown unit "${u}"`);
    }

    type DateSetter = keyof Pick<Date, 'setFullYear' | 'setMonth' | 'setDate' | 'setHours' | 'setMinutes' | 'setSeconds' | 'setMilliseconds' |
                                    'setUTCFullYear' | 'setUTCMonth' | 'setUTCDate' | 'setUTCHours' | 'setUTCMinutes' | 'setUTCSeconds' | 'setUTCMilliseconds'>;
    const fn = inst._d[method as DateSetter];
    fn.call(inst._d, u === 'month' ? val - 1 : val);
    return inst;
  }

  /** Add n units */
  add(n: number, unit: Unit): DateFormat {
    if (unit === 'month' || unit === 'year') {
      return this.set(unit, this.get(unit) + n);
    }
    
    const ms = DateFormat.UNIT_MS[unit];
    if (isNaN(ms)) {
      throw new Error(`Unknown unit "${unit}"`);
    }
    
    return new DateFormat(this.valueOf() + n * ms, { utc: this._utc });
  }

  /** Subtract n units */
  subtract(n: number, unit: Unit): DateFormat {
    return this.add(-n, unit);
  }

  /** Comparisons */
  isBefore(o: string|number|Date|DateFormat): boolean {
    return this.valueOf() < new DateFormat(o as string | number | Date).valueOf();
  }
  isAfter(o: string|number|Date|DateFormat): boolean {
    return this.valueOf() > new DateFormat(o as string | number | Date).valueOf();
  }
  isSame(o: string|number|Date|DateFormat): boolean {
    return this.valueOf() === new DateFormat(o as string | number | Date).valueOf();
  }
  isBetween(a: string|number|Date|DateFormat, b: string|number|Date|DateFormat): boolean {
    const t = this.valueOf();
    const A = new DateFormat(a as string | number | Date).valueOf();
    const B = new DateFormat(b as string | number | Date).valueOf();
    return t > A && t < B;
  }

  /** Toggle UTC/local */
  utc(): DateFormat { 
    const c = this.clone();
    Object.defineProperty(c, '_utc', {
      value: true,
      writable: false,
      enumerable: true,
      configurable: true
    });
    return c;
  }
  local(): DateFormat { 
    const c = this.clone();
    Object.defineProperty(c, '_utc', {
      value: false,
      writable: false,
      enumerable: true,
      configurable: true
    });
    return c;
  }

  /** Days in the month */
  daysInMonth(): number {
    const Y = this.get('year'), M = this.get('month');
    return new Date(Y, M, 0).getDate();
  }

  /** Leap-year */
  isLeapYear(): boolean {
    const y = this.get('year');
    return (y%4===0 && y%100!==0) || y%400===0;
  }

  /** Day of the year 1–366 */
  dayOfYear(): number {
    const start = DateFormat.parse(`${this.get('year')}-01-01`,'YYYY-MM-DD',true);
    return Math.floor((this.valueOf()-start.valueOf())/864e5)+1;
  }

  /** Weekday 0–6 */
  weekday(): number {
    return this.get('day');
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
      return 'Invalid Date';
    }

    const Y = String(this.get('year'));
    const M = this.get('month');
    const D = this.get('date');
    const H = this.get('hour');
    const m = this.get('minute');
    const s = this.get('second');

    // Basic replacements
    return fmt
      .replace(/YYYY/g, Y)
      .replace(/YY/g, Y.slice(-2))
      .replace(/MM/g, String(M).padStart(2, '0'))
      .replace(/M(?!o)/g, String(M))
      .replace(/DD/g, String(D).padStart(2, '0'))
      .replace(/D(?!D)/g, String(D))
      .replace(/HH/g, String(H).padStart(2, '0'))
      .replace(/H(?!H)/g, String(H))
      .replace(/hh/g, String(H % 12 || 12).padStart(2, '0'))
      .replace(/h(?!h)/g, String(H % 12 || 12))
      .replace(/mm/g, String(m).padStart(2, '0'))
      .replace(/m(?!m)/g, String(m))
      .replace(/ss/g, String(s).padStart(2, '0'))
      .replace(/s(?!s)/g, String(s))
      .replace(/A/g, H < 12 ? 'AM' : 'PM')
      .replace(/a/g, H < 12 ? 'am' : 'pm');
  }

  /** Intl-based formatting */
  formatIntl(opts: Intl.DateTimeFormatOptions={}): string {
    const loc = DateFormat._currentLocale || undefined;
    return new Intl.DateTimeFormat(loc, opts).format(this.toDate());
  }

  /** Relative time */
  fromNow(): string {
    const diff = this.valueOf() - Date.now();
    const ms = Math.abs(diff);
    const sec = Math.floor(ms/1000);
    const min = Math.floor(sec/60);
    const hr = Math.floor(min/60);
    const d = Math.floor(hr/24);
    
    let val: number;
    let unit: HumanizeUnit;
    
    if (sec < 60) {
      val = sec;
      unit = 's';
    } else if (min < 60) {
      val = min;
      unit = 'm';
    } else if (hr < 24) {
      val = hr;
      unit = 'h';
    } else {
      val = d;
      unit = 'd';
    }
    
    const str = new Duration(diff < 0 ? -val * DateFormat.UNIT_MS[unit as Unit] : val * DateFormat.UNIT_MS[unit as Unit])
      .humanize(false);
      
    return diff < 0 ? `${str} ago` : `in ${str}`;
  }

  /** ISO week (1–53) */
  isoWeek(): number {
    const d = this.clone().utc();
    const day = d.get('day')||7;
    d.set('date', d.get('date') + 4 - day);
    const Y = d.get('year');
    const start = Date.UTC(Y,0,1);
    const diff = d.valueOf() - start;
    return Math.ceil((diff/864e5 + 1)/7);
  }

  /** ISO week-year */
  isoWeekYear(): number {
    const w = this.isoWeek(), M = this.get('month');
    let Y = this.get('year');
    if (w === 0)               Y -= 1;
    else if (w >= 52 && M===1) Y += 1;
    return Y;
  }

  /** Alias for isoWeek() */
  week(): number {
    return this.isoWeek();
  }

  /** Weeks in year */
  weeksInYear(): number {
    return this.clone().set('month',12).set('date',31).isoWeek();
  }

  /** Calendar output */
  calendar(): string {
    const today0 = new DateFormat().startOf('day').valueOf();
    const diff   = this.valueOf() - today0;
    const D      = 864e5, T = this.format('hh:mm A');
    if      (diff>=0 && diff< D)  return `Today at ${T}`;
    else if (diff<0  && diff>-D)  return `Yesterday at ${T}`;
    else if (diff>=D&& diff<2*D)  return `Tomorrow at ${T}`;
    return this.format('YYYY-MM-DD');
  }

  /** Start of unit */
  startOf(u: Unit|'week'|'quarter'): DateFormat {
    const d = this.clone();
    switch(u) {
      case 'year':
        return d.set('month', 1).set('date', 1).startOf('day');
      case 'month':
        return d.set('date', 1).startOf('day');
      case 'week': {
        const day = d.get('day');
        return d.subtract(day, 'day').startOf('day');
      }
      case 'quarter': {
        const m = d.get('month');
        return d.set('month', Math.floor((m-1)/3)*3 + 1).startOf('month');
      }
      case 'day':
        return d.set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
      case 'hour':
        return d.set('minute', 0).set('second', 0).set('millisecond', 0);
      case 'minute':
        return d.set('second', 0).set('millisecond', 0);
      case 'second':
        return d.set('millisecond', 0);
      default:
        return d;
    }
  }

  /** End of unit */
  endOf(u: Unit|'week'|'quarter'): DateFormat {
    return this.startOf(u).add(1, u as Unit).subtract(1, 'millisecond');
  }
}
