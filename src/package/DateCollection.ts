import DateFormat from './DateFormat'
import type { GroupByUnit, UniqueUnit } from './type'

export default class DateCollection {
  private readonly _dates: DateFormat[]

  constructor(dates: (string | number | Date | DateFormat)[]) {
    this._dates = dates.map(
      (d) => (d instanceof DateFormat ? d.clone() : new DateFormat(d as string | number | Date))
    )
  }

  sort(order: 'asc' | 'desc' = 'asc'): DateCollection {
    const sorted = [...this._dates].sort((a, b) => {
      const diff = a.valueOf() - b.valueOf()
      return order === 'asc' ? diff : -diff
    })
    return new DateCollection(sorted)
  }

  closest(target: DateFormat): DateFormat {
    if (this._dates.length === 0) {
      throw new Error('Cannot find closest in an empty collection')
    }
    let best = this._dates[0]
    let bestDiff = Math.abs(best.valueOf() - target.valueOf())
    for (let i = 1; i < this._dates.length; i++) {
      const diff = Math.abs(this._dates[i].valueOf() - target.valueOf())
      if (diff < bestDiff) {
        best = this._dates[i]
        bestDiff = diff
      }
    }
    return best.clone()
  }

  farthest(target: DateFormat): DateFormat {
    if (this._dates.length === 0) {
      throw new Error('Cannot find farthest in an empty collection')
    }
    let best = this._dates[0]
    let bestDiff = Math.abs(best.valueOf() - target.valueOf())
    for (let i = 1; i < this._dates.length; i++) {
      const diff = Math.abs(this._dates[i].valueOf() - target.valueOf())
      if (diff > bestDiff) {
        best = this._dates[i]
        bestDiff = diff
      }
    }
    return best.clone()
  }

  groupBy(unit: GroupByUnit): Map<string, DateFormat[]> {
    const groups = new Map<string, DateFormat[]>()
    for (const d of this._dates) {
      let key: string
      switch (unit) {
        case 'year':
          key = String(d.get('year'))
          break
        case 'month':
          key = `${d.get('year')}-${String(d.get('month')).padStart(2, '0')}`
          break
        case 'week':
          key = `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, '0')}`
          break
        case 'day':
          key = d.format('YYYY-MM-DD')
          break
        case 'hour':
          key = `${d.format('YYYY-MM-DD')}T${String(d.get('hour')).padStart(2, '0')}`
          break
        case 'quarter':
          key = `${d.get('year')}-Q${d.quarter()}`
          break
      }
      const arr = groups.get(key)
      if (arr) {
        arr.push(d.clone())
      } else {
        groups.set(key, [d.clone()])
      }
    }
    return groups
  }

  filter(fn: (d: DateFormat) => boolean): DateCollection {
    return new DateCollection(this._dates.filter(fn))
  }

  unique(unit?: UniqueUnit): DateCollection {
    if (!unit) {
      const seen = new Set<number>()
      const result: DateFormat[] = []
      for (const d of this._dates) {
        const v = d.valueOf()
        if (!seen.has(v)) {
          seen.add(v)
          result.push(d)
        }
      }
      return new DateCollection(result)
    }

    const seen = new Set<string>()
    const result: DateFormat[] = []
    for (const d of this._dates) {
      let key: string
      switch (unit) {
        case 'year':
          key = String(d.get('year'))
          break
        case 'month':
          key = `${d.get('year')}-${d.get('month')}`
          break
        case 'week':
          key = `${d.isoWeekYear()}-${d.isoWeek()}`
          break
        case 'day':
          key = `${d.get('year')}-${d.get('month')}-${d.get('date')}`
          break
        case 'hour':
          key = `${d.get('year')}-${d.get('month')}-${d.get('date')}-${d.get('hour')}`
          break
        case 'minute':
          key = `${d.get('year')}-${d.get('month')}-${d.get('date')}-${d.get('hour')}-${d.get('minute')}`
          break
        case 'second':
          key = `${d.get('year')}-${d.get('month')}-${d.get('date')}-${d.get('hour')}-${d.get('minute')}-${d.get('second')}`
          break
      }
      if (!seen.has(key)) {
        seen.add(key)
        result.push(d)
      }
    }
    return new DateCollection(result)
  }

  first(): DateFormat {
    if (this._dates.length === 0) {
      throw new Error('Cannot get first from an empty collection')
    }
    return this._dates[0].clone()
  }

  last(): DateFormat {
    if (this._dates.length === 0) {
      throw new Error('Cannot get last from an empty collection')
    }
    return this._dates[this._dates.length - 1].clone()
  }

  nth(n: number): DateFormat {
    if (n < 0 || n >= this._dates.length) {
      throw new Error(`Index ${n} out of bounds for collection of size ${this._dates.length}`)
    }
    return this._dates[n].clone()
  }

  count(): number {
    return this._dates.length
  }

  min(): DateFormat {
    if (this._dates.length === 0) {
      throw new Error('Cannot get min from an empty collection')
    }
    return this._dates.reduce((a, b) => (a.valueOf() <= b.valueOf() ? a : b)).clone()
  }

  max(): DateFormat {
    if (this._dates.length === 0) {
      throw new Error('Cannot get max from an empty collection')
    }
    return this._dates.reduce((a, b) => (a.valueOf() >= b.valueOf() ? a : b)).clone()
  }

  map<T>(fn: (d: DateFormat) => T): T[] {
    return this._dates.map(fn)
  }

  toArray(): DateFormat[] {
    return this._dates.map((d) => d.clone())
  }

  isEmpty(): boolean {
    return this._dates.length === 0
  }

  between(start: DateFormat, end: DateFormat): DateCollection {
    return new DateCollection(
      this._dates.filter((d) => d.valueOf() >= start.valueOf() && d.valueOf() <= end.valueOf())
    )
  }

  compact(): DateCollection {
    return new DateCollection(this._dates.filter((d) => d.isValid()))
  }
}
