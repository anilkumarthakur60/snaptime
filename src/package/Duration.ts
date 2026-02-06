import { Unit } from './type'

/** A length of time with parse/add/subtract/humanize/format */
export default class Duration {
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

  static isDuration(obj: any): obj is Duration {
    return obj instanceof Duration
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
      unknown: NaN,
      week: 6048e5, // 7 days
      quarter: 7776e6 // ~3 months
    }
    return this._ms / (map[unit] ?? 1)
  }

  get(unit: Unit): number {
    const ms = this._ms
    const map: Record<Unit, number> = {
      millisecond: 1,
      second: 1e3,
      minute: 6e4,
      hour: 36e5,
      day: 864e5,
      date: 864e5,
      month: 2592e6,
      year: 31536e6,
      fortnight: 1209.6e6,
      unknown: NaN,
      week: 6048e5,
      quarter: 7776e6
    }
    return Math.floor(ms / (map[unit] ?? 1))
  }

  milliseconds(): number {
    return Math.floor(this._ms % 1000)
  }

  asMilliseconds(): number {
    return this.as('millisecond')
  }

  seconds(): number {
    return Math.floor((this._ms / 1000) % 60)
  }

  asSeconds(): number {
    return this.as('second')
  }

  minutes(): number {
    return Math.floor((this._ms / 60000) % 60)
  }

  asMinutes(): number {
    return this.as('minute')
  }

  hours(): number {
    return Math.floor((this._ms / 3600000) % 24)
  }

  asHours(): number {
    return this.as('hour')
  }

  days(): number {
    return Math.floor((this._ms / 86400000) % 30)
  }

  asDays(): number {
    return this.as('day')
  }

  weeks(): number {
    return Math.floor((this._ms / 604800000) % 4)
  }

  asWeeks(): number {
    return this.as('week')
  }

  months(): number {
    return Math.floor((this._ms / 2592000000) % 12)
  }

  asMonths(): number {
    return this.as('month')
  }

  years(): number {
    return Math.floor(this._ms / 31536000000)
  }

  asYears(): number {
    return this.as('year')
  }

  add(n: number, unit: Unit): Duration {
    const u0 = Duration.parse(`1${unit[0]}`)
    return new Duration(this._ms + n * u0._ms)
  }

  subtract(n: number, unit: Unit): Duration {
    return this.add(-n, unit)
  }

  clone(): Duration {
    return new Duration(this._ms)
  }

  humanize(withSuffix = false, _thresholds?: Record<string, number>): string {
    const ms = Math.abs(this._ms)
    const isNegative = this._ms < 0

    if (ms < 1000) {
      const val = Math.round(ms)
      return withSuffix ? (isNegative ? `${val} milliseconds ago` : `in ${val} milliseconds`) : `${val}ms`
    }
    const s = ms / 1000
    if (s < 60) {
      const val = Math.round(s)
      return withSuffix ? (isNegative ? `${val} seconds ago` : `in ${val} seconds`) : `${val}s`
    }
    const m = s / 60
    if (m < 60) {
      const val = Math.round(m)
      return withSuffix ? (isNegative ? `${val} minutes ago` : `in ${val} minutes`) : `${val}m`
    }
    const h = m / 60
    if (h < 24) {
      const val = Math.round(h)
      return withSuffix ? (isNegative ? `${val} hours ago` : `in ${val} hours`) : `${val}h`
    }
    const d = h / 24
    const val = Math.round(d)
    return withSuffix ? (isNegative ? `${val} days ago` : `in ${val} days`) : `${val}d`
  }

  format(fmt: string): string {
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

  toJSON(): string {
    return this.toISOString()
  }

  toISOString(): string {
    const years = Math.floor(this._ms / 31536000000)
    const months = Math.floor((this._ms % 31536000000) / 2592000000)
    const days = Math.floor((this._ms % 2592000000) / 86400000)
    const hours = Math.floor((this._ms % 86400000) / 3600000)
    const minutes = Math.floor((this._ms % 3600000) / 60000)
    const seconds = Math.floor((this._ms % 60000) / 1000)
    const ms = this._ms % 1000

    let result = 'P'
    if (years > 0) result += `${years}Y`
    if (months > 0) result += `${months}M`
    if (days > 0) result += `${days}D`
    
    if (hours > 0 || minutes > 0 || seconds > 0 || ms > 0) {
      result += 'T'
      if (hours > 0) result += `${hours}H`
      if (minutes > 0) result += `${minutes}M`
      if (seconds > 0 || ms > 0) {
        const totalSeconds = seconds + ms / 1000
        result += `${totalSeconds}S`
      }
    }
    
    return result === 'P' ? 'PT0S' : result
  }
}
