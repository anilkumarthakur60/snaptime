import DateFormat from './DateFormat'
import type { Unit } from './type'

const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
}

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12
}

const UNIT_MAP: Record<string, Unit> = {
  day: 'day',
  days: 'day',
  week: 'week',
  weeks: 'week',
  month: 'month',
  months: 'month',
  year: 'year',
  years: 'year'
}

function parseMonth(s: string): number | undefined {
  return MONTHS[s.toLowerCase()]
}

function parseWeekday(s: string): number | undefined {
  return WEEKDAYS[s.toLowerCase()]
}

function parseOrdinal(s: string): number {
  return parseInt(s, 10)
}

function nthWeekdayOfMonth(n: number, weekday: number, month: number, year: number): DateFormat {
  // Start at the 1st of the month
  let d = new DateFormat(new Date(year, month - 1, 1))
  const firstDow = d.get('day')
  // Days until the first occurrence of the target weekday
  let offset = (weekday - firstDow + 7) % 7
  // Move to the nth occurrence
  offset += (n - 1) * 7
  d = d.add(offset, 'day')
  // Verify we're still in the same month
  if (d.get('month') !== month) {
    return new DateFormat(NaN)
  }
  return d
}

export default function parseNatural(input: string, ref?: DateFormat): DateFormat {
  const base = ref ?? new DateFormat()
  const s = input.trim()
  const lower = s.toLowerCase()

  // "now", "today", "tomorrow", "yesterday"
  if (lower === 'now' || lower === 'today') return base
  if (lower === 'tomorrow') return base.add(1, 'day')
  if (lower === 'yesterday') return base.subtract(1, 'day')

  // "beginning of day/week/month/year"
  let m = lower.match(/^beginning\s+of\s+(day|week|month|year)$/)
  if (m) {
    const unit = m[1] as Unit | 'week'
    return base.startOf(unit)
  }

  // "end of day/week/month/year"
  m = lower.match(/^end\s+of\s+(day|week|month|year)$/)
  if (m) {
    const unit = m[1] as Unit | 'week'
    return base.endOf(unit)
  }

  // "next/last Monday..Sunday"
  m = lower.match(/^(next|last)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/)
  if (m) {
    const dir = m[1]
    const targetDay = parseWeekday(m[2])!
    const currentDay = base.get('day')
    if (dir === 'next') {
      let diff = (targetDay - currentDay + 7) % 7
      if (diff === 0) diff = 7
      return base.add(diff, 'day')
    } else {
      let diff = (currentDay - targetDay + 7) % 7
      if (diff === 0) diff = 7
      return base.subtract(diff, 'day')
    }
  }

  // "next/last week/month/year"
  m = lower.match(/^(next|last)\s+(week|month|year)$/)
  if (m) {
    const unit = UNIT_MAP[m[2]]!
    return m[1] === 'next' ? base.add(1, unit) : base.subtract(1, unit)
  }

  // "N days/weeks/months/years ago"
  m = lower.match(/^(\d+)\s+(days?|weeks?|months?|years?)\s+ago$/)
  if (m) {
    const n = parseInt(m[1], 10)
    const unit = UNIT_MAP[m[2]]!
    return base.subtract(n, unit)
  }

  // "in N days/weeks/months/years"
  m = lower.match(/^in\s+(\d+)\s+(days?|weeks?|months?|years?)$/)
  if (m) {
    const n = parseInt(m[1], 10)
    const unit = UNIT_MAP[m[2]]!
    return base.add(n, unit)
  }

  // "N days/weeks/months/years from now"
  m = lower.match(/^(\d+)\s+(days?|weeks?|months?|years?)\s+from\s+now$/)
  if (m) {
    const n = parseInt(m[1], 10)
    const unit = UNIT_MAP[m[2]]!
    return base.add(n, unit)
  }

  // "last day of March" or "last day of March 2026"
  m = lower.match(
    /^last\s+day\s+of\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?$/
  )
  if (m) {
    const month = parseMonth(m[1])!
    const year = m[2] ? parseInt(m[2], 10) : base.get('year')
    // Last day: go to next month's 0th day
    const lastDay = new Date(year, month, 0).getDate()
    return new DateFormat(new Date(year, month - 1, lastDay))
  }

  // "first day of March" or "first day of March 2026"
  m = lower.match(
    /^first\s+day\s+of\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?$/
  )
  if (m) {
    const month = parseMonth(m[1])!
    const year = m[2] ? parseInt(m[2], 10) : base.get('year')
    return new DateFormat(new Date(year, month - 1, 1))
  }

  // "Nth weekday of month" e.g. "3rd Friday of January" or "2nd Tuesday of March 2026"
  m = lower.match(
    /^(\d+)(?:st|nd|rd|th)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+of\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?$/
  )
  if (m) {
    const n = parseOrdinal(m[1])
    const weekday = parseWeekday(m[2])!
    const month = parseMonth(m[3])!
    const year = m[4] ? parseInt(m[4], 10) : base.get('year')
    return nthWeekdayOfMonth(n, weekday, month, year)
  }

  // No pattern matched
  return new DateFormat(NaN)
}
