import DateTime from '../core/DateTime'
import type { DateInput, HolidayCountry } from '../core/types'
import { Holidays } from './holidays/index'

function toDT(input: DateInput): DateTime {
  return input instanceof DateTime ? input : new DateTime(input)
}

/** True when `date` is a weekday and not in `holidays` (YYYY-MM-DD strings). */
export function isBusinessDay(date: DateInput, holidays?: string[]): boolean {
  const d = toDT(date)
  const day = d.get('day')
  if (day === 0 || day === 6) return false
  if (holidays && holidays.includes(d.format('YYYY-MM-DD'))) return false
  return true
}

/** Add `n` business days. Negative `n` goes backwards. */
export function addBusinessDays(date: DateInput, n: number, holidays?: string[]): DateTime {
  const start = toDT(date)
  if (n === 0) return start
  const dir = n > 0 ? 1 : -1
  let remaining = Math.abs(n)
  let cursor = start
  while (remaining > 0) {
    cursor = cursor.add(dir, 'day')
    if (isBusinessDay(cursor, holidays)) remaining--
  }
  return cursor
}

export function subtractBusinessDays(date: DateInput, n: number, holidays?: string[]): DateTime {
  return addBusinessDays(date, -n, holidays)
}

export function nextBusinessDay(date: DateInput, holidays?: string[]): DateTime {
  return addBusinessDays(date, 1, holidays)
}

export function prevBusinessDay(date: DateInput, holidays?: string[]): DateTime {
  return addBusinessDays(date, -1, holidays)
}

/**
 * Count business days strictly between `start` and `end` (exclusive).
 * Returns negative when `end` is before `start`.
 */
export function businessDaysBetween(start: DateInput, end: DateInput, holidays?: string[]): number {
  const from = toDT(start)
  const s = from.valueOf()
  const e = toDT(end).valueOf()
  if (s === e) return 0
  const dir = e > s ? 1 : -1
  let count = 0
  let cursor = from

  while (true) {
    cursor = cursor.add(dir, 'day')
    if ((dir === 1 && cursor.valueOf() >= e) || (dir === -1 && cursor.valueOf() <= e)) break
    if (isBusinessDay(cursor, holidays)) count++
  }
  return count * dir
}

/** Built-in country calendars  delegates to the holidays registry. */
export function getHolidays(country: HolidayCountry | (string & {}), year: number): string[] {
  return Holidays.for(country, year)
}
