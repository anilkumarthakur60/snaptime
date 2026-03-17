import type { RangeIterateUnit, Unit } from './type'
import DateFormat from './DateFormat'
import Duration from './Duration'

export default class DateRange {
  readonly start: DateFormat
  readonly end: DateFormat

  constructor(
    start: string | number | Date | DateFormat,
    end: string | number | Date | DateFormat
  ) {
    this.start = start instanceof DateFormat ? start : new DateFormat(start)
    this.end = end instanceof DateFormat ? end : new DateFormat(end)
  }

  isValid(): boolean {
    return this.start.isValid() && this.end.isValid()
  }

  /** True when start <= end */
  isForward(): boolean {
    return this.start.valueOf() <= this.end.valueOf()
  }

  /** Absolute duration between start and end */
  duration(): Duration {
    return new Duration(Math.abs(this.end.valueOf() - this.start.valueOf()))
  }

  /** True if the given date falls within [start, end] (inclusive by default) */
  contains(date: string | number | Date | DateFormat, inclusive = true): boolean {
    const d = date instanceof DateFormat ? date : new DateFormat(date)
    const t = d.valueOf()
    const lo = Math.min(this.start.valueOf(), this.end.valueOf())
    const hi = Math.max(this.start.valueOf(), this.end.valueOf())
    if (inclusive) {
      return t >= lo && t <= hi
    }
    return t > lo && t < hi
  }

  /** True if this range temporally overlaps with another */
  overlaps(other: DateRange): boolean {
    const aStart = Math.min(this.start.valueOf(), this.end.valueOf())
    const aEnd = Math.max(this.start.valueOf(), this.end.valueOf())
    const bStart = Math.min(other.start.valueOf(), other.end.valueOf())
    const bEnd = Math.max(other.start.valueOf(), other.end.valueOf())
    return aStart <= bEnd && aEnd >= bStart
  }

  /** Intersection, or null if they don't overlap */
  intersect(other: DateRange): DateRange | null {
    if (!this.overlaps(other)) return null
    const aStart = Math.min(this.start.valueOf(), this.end.valueOf())
    const aEnd = Math.max(this.start.valueOf(), this.end.valueOf())
    const bStart = Math.min(other.start.valueOf(), other.end.valueOf())
    const bEnd = Math.max(other.start.valueOf(), other.end.valueOf())
    return new DateRange(
      new DateFormat(Math.max(aStart, bStart)),
      new DateFormat(Math.min(aEnd, bEnd))
    )
  }

  /** Union of two overlapping/adjacent ranges, or null if they don't overlap */
  merge(other: DateRange): DateRange | null {
    if (!this.overlaps(other)) return null
    const all = [
      this.start.valueOf(),
      this.end.valueOf(),
      other.start.valueOf(),
      other.end.valueOf()
    ]
    return new DateRange(new DateFormat(Math.min(...all)), new DateFormat(Math.max(...all)))
  }

  /** Split range into chunks of n units */
  split(n: number, unit: RangeIterateUnit): DateRange[] {
    const result: DateRange[] = []
    const lo = Math.min(this.start.valueOf(), this.end.valueOf())
    const hi = Math.max(this.start.valueOf(), this.end.valueOf())
    let cursor = new DateFormat(lo)

    while (cursor.valueOf() < hi) {
      const next = cursor.add(n, unit as Unit)
      const chunkEnd = next.valueOf() > hi ? new DateFormat(hi) : next
      result.push(new DateRange(cursor, chunkEnd))
      cursor = next
    }

    return result
  }

  /** Generator that yields each date stepping by 1 unit */
  *iterate(unit: RangeIterateUnit): Generator<DateFormat> {
    const lo = Math.min(this.start.valueOf(), this.end.valueOf())
    const hi = Math.max(this.start.valueOf(), this.end.valueOf())
    let cursor = new DateFormat(lo)

    while (cursor.valueOf() <= hi) {
      yield cursor
      cursor = cursor.add(1, unit as Unit)
    }
  }

  /** Collect all dates from iterate() into an array */
  toArray(unit: RangeIterateUnit): DateFormat[] {
    const result: DateFormat[] = []
    for (const d of this.iterate(unit)) {
      result.push(d)
    }
    return result
  }

  /** "Jan 1 – Mar 31, 2026" style label */
  humanize(): string {
    const startYear = this.start.get('year')
    const endYear = this.end.get('year')

    if (startYear === endYear) {
      return `${this.start.format('MMM D')} \u2013 ${this.end.format('MMM D, YYYY')}`
    }
    return `${this.start.format('MMM D, YYYY')} \u2013 ${this.end.format('MMM D, YYYY')}`
  }

  equals(other: DateRange): boolean {
    return (
      this.start.valueOf() === other.start.valueOf() && this.end.valueOf() === other.end.valueOf()
    )
  }

  toString(): string {
    return `${this.start.format('YYYY-MM-DD')} / ${this.end.format('YYYY-MM-DD')}`
  }
}
