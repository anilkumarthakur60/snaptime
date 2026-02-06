import type { Unit } from '../type'
import { UNIT_MS } from '../utils/constants'
import { isValidUnit } from '../utils/validators'
import { DurationExtractor } from './extractor'
import { TimeDurationFormatter } from './time-duration-formatter'

// Re-export for backward compatibility
export { DurationExtractor, TimeDurationFormatter }

/** A length of time with parse/add/subtract/humanize/format */
export default class TimeDuration {
  private _ms: number

  constructor(ms: number = 0) {
    this._ms = ms
  }

  static parse(input: string): TimeDuration {
    const re = /(\d+(?:\.\d+)?)(ms|[YyMwdhms])/g
    let total = 0
    let m: RegExpExecArray | null

    while ((m = re.exec(input))) {
      const v = parseFloat(m[1])
      const unit = m[2]
      total += v * (UNIT_MS[this.normalizeUnitChar(unit)] ?? 1)
    }

    return new TimeDuration(total)
  }

  static isTimeDuration(obj: unknown): obj is TimeDuration {
    return obj instanceof TimeDuration
  }

  private static normalizeUnitChar(char: string): Unit {
    const map: Record<string, Unit> = {
      Y: 'year',
      y: 'year',
      M: 'month',
      w: 'week',
      d: 'day',
      h: 'hour',
      m: 'minute',
      s: 'second',
      ms: 'millisecond'
    }
    return map[char] ?? 'unknown'
  }

  as(unit: Unit): number {
    if (!isValidUnit(unit)) return NaN
    return this._ms / (UNIT_MS[unit] ?? 1)
  }

  get(unit: Unit): number {
    if (!isValidUnit(unit)) return NaN
    return Math.floor(this._ms / (UNIT_MS[unit] ?? 1))
  }

  // Component getters (remainder values)
  milliseconds(): number {
    return DurationExtractor.milliseconds(this._ms)
  }

  seconds(): number {
    return DurationExtractor.seconds(this._ms)
  }

  minutes(): number {
    return DurationExtractor.minutes(this._ms)
  }

  hours(): number {
    return DurationExtractor.hours(this._ms)
  }

  days(): number {
    return DurationExtractor.days(this._ms)
  }

  weeks(): number {
    return DurationExtractor.weeks(this._ms)
  }

  months(): number {
    return DurationExtractor.months(this._ms)
  }

  years(): number {
    return DurationExtractor.years(this._ms)
  }

  // Total getters (full conversion)
  asMilliseconds(): number {
    return this.as('millisecond')
  }

  asSeconds(): number {
    return this.as('second')
  }

  asMinutes(): number {
    return this.as('minute')
  }

  asHours(): number {
    return this.as('hour')
  }

  asDays(): number {
    return this.as('day')
  }

  asWeeks(): number {
    return this.as('week')
  }

  asMonths(): number {
    return this.as('month')
  }

  asYears(): number {
    return this.as('year')
  }

  add(n: number, unit: Unit): TimeDuration {
    const u0 = TimeDuration.parse(`1${unit[0]}`)
    return new TimeDuration(this._ms + n * u0._ms)
  }

  subtract(n: number, unit: Unit): TimeDuration {
    return this.add(-n, unit)
  }

  clone(): TimeDuration {
    return new TimeDuration(this._ms)
  }

  humanize(withSuffix = false): string {
    return TimeDurationFormatter.humanize(this._ms, withSuffix)
  }

  format(fmt: string): string {
    return TimeDurationFormatter.format(this._ms, fmt)
  }

  toJSON(): string {
    return this.toISOString()
  }

  toISOString(): string {
    return TimeDurationFormatter.toISO8601(this._ms)
  }
}
