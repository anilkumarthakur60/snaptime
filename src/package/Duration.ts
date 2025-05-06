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
