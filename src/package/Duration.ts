import type { Unit } from './type'

/** A length of time with parse/add/subtract/humanize/format */
export default class Duration {
  private _ms: number

  constructor(ms: number = 0) {
    this._ms = ms
  }

  // ── Static ───────────────────────────────────────────────────────────────────

  private static readonly MS_PER_UNIT: Partial<Record<Unit, number>> = {
    millisecond: 1,
    second:      1_000,
    minute:      60_000,
    hour:        3_600_000,
    day:         86_400_000,
    date:        86_400_000,
    week:        604_800_000,
    fortnight:   1_209_600_000,
    month:       2_592_000_000,
    year:        31_536_000_000,
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

  // ── Core ─────────────────────────────────────────────────────────────────────

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
    }
    return this._ms / (map[unit] ?? 1)
  }

  add(n: number, unit: Unit): Duration {
    const ms = Duration.MS_PER_UNIT[unit]
    if (ms === undefined) throw new Error(`Cannot add/subtract unit "${unit}"`)
    return new Duration(this._ms + n * ms)
  }

  subtract(n: number, unit: Unit): Duration {
    return this.add(-n, unit)
  }

  // ── Convenience aliases ───────────────────────────────────────────────────────

  toMilliseconds(): number {
    return this.as('millisecond')
  }

  toSeconds(): number {
    return this.as('second')
  }

  toMinutes(): number {
    return this.as('minute')
  }

  toHours(): number {
    return this.as('hour')
  }

  toDays(): number {
    return this.as('day')
  }

  // ── Value / inspection ────────────────────────────────────────────────────────

  valueOf(): number {
    return this._ms
  }

  isZero(): boolean {
    return this._ms === 0
  }

  isNegative(): boolean {
    return this._ms < 0
  }

  abs(): Duration {
    return new Duration(Math.abs(this._ms))
  }

  // ── Humanize / format ─────────────────────────────────────────────────────────

  /**
   * Human-readable representation.
   * - `short=true` (default): compact, e.g. "3d"
   * - `short=false`: multi-unit long form, e.g. "2 days, 3 hours, 15 minutes"
   */
  humanize(short = true): string {
    const ms = Math.abs(this._ms)

    if (short) {
      if (ms < 1000) return `${Math.round(ms)}ms`
      const s = ms / 1000
      if (s < 60) return `${Math.round(s)}s`
      const m = s / 60
      if (m < 60) return `${Math.round(m)}m`
      const h = m / 60
      if (h < 24) return `${Math.round(h)}h`
      const d = h / 24
      return `${Math.round(d)}d`
    }

    // Long form: multi-unit breakdown
    const parts: string[] = []

    const totalSec = Math.floor(ms / 1000)
    const days = Math.floor(totalSec / 86400)
    const hours = Math.floor((totalSec % 86400) / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    const milliseconds = Math.floor(ms % 1000)

    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`)
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`)
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`)
    if (seconds > 0) parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`)
    if (milliseconds > 0 && parts.length === 0)
      parts.push(`${milliseconds} ${milliseconds === 1 ? 'millisecond' : 'milliseconds'}`)

    return parts.join(', ') || '0 milliseconds'
  }

  toString(): string {
    return this.humanize()
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
}
