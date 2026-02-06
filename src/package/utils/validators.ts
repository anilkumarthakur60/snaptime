import type { Unit } from '../type'
import { UNIT_MS } from './constants'

export function isValidUnit(unit: string): unit is Unit {
  return unit in UNIT_MS
}

export function normalizeUnit(unit: string): Unit {
  const normalized = unit.toLowerCase()

  const aliases: Record<string, Unit> = {
    y: 'year',
    year: 'year',
    years: 'year',
    M: 'month',
    month: 'month',
    months: 'month',
    w: 'week',
    week: 'week',
    weeks: 'week',
    d: 'day',
    day: 'day',
    days: 'day',
    h: 'hour',
    hour: 'hour',
    hours: 'hour',
    m: 'minute',
    minute: 'minute',
    minutes: 'minute',
    s: 'second',
    second: 'second',
    seconds: 'second',
    ms: 'millisecond',
    millisecond: 'millisecond',
    milliseconds: 'millisecond',
    q: 'quarter',
    quarter: 'quarter',
    quarters: 'quarter',
    f: 'fortnight',
    fortnight: 'fortnight',
    fortnights: 'fortnight'
  }

  return aliases[normalized] ?? 'unknown'
}

export function isDate(obj: any): obj is Date {
  return obj instanceof Date && !isNaN(obj.getTime())
}
