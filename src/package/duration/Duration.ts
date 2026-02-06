import type { Unit } from '../type'
import { UNIT_MS } from '../utils/constants'
import { isValidUnit } from '../utils/validators'
import { DurationComponent } from './components'
import { DurationFormatter } from './formatter'

/** A length of time with parse/add/subtract/humanize/format */
export default class Duration {
  private _ms: number

  constructor(ms: number = 0) {
    this._ms = ms
  }

  static parse(input: string): Duration {
    const re = /(\d+(?:\.\d+)?)(ms|[YyMwdhms])/g
    let total = 0
    let m: RegExpExecArray | null

    while ((m = re.exec(input))) {
      const v = parseFloat(m[1])
      const unit = m[2]
      total += v * (UNIT_MS[this.normalizeUnitChar(unit)] ?? 1)
    }

    return new Duration(total)
  }

  static isDuration(obj: any): obj is Duration {
    return obj instanceof Duration
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
    return DurationComponent.milliseconds(this._ms)
  }

  seconds(): number {
    return DurationComponent.seconds(this._ms)
  }

  minutes(): number {
    return DurationComponent.minutes(this._ms)
  }

  hours(): number {
    return DurationComponent.hours(this._ms)
  }

  days(): number {
    return DurationComponent.days(this._ms)
  }

  weeks(): number {
    return DurationComponent.weeks(this._ms)
  }

  months(): number {
    return DurationComponent.months(this._ms)
  }

  years(): number {
    return DurationComponent.years(this._ms)
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
    return DurationFormatter.humanize(this._ms, withSuffix)
  }

  format(fmt: string): string {
    return DurationFormatter.format(this._ms, fmt)
  }

  toJSON(): string {
    return this.toISOString()
  }

  toISOString(): string {
    return DurationFormatter.toISO8601(this._ms)
  }
}
