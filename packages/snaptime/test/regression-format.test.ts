// ─────────────────────────────────────────────────────────────────────────────
// Regression tests for audited format/parse/duration/locale defects.
// Each `describe` block pins one audited bug by its audit ID.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import DateFormat from '../src/core/DateTime'
import Duration from '../src/core/Duration'
import { Clock } from '../src/core/Clock'
import { calendarLabel } from '../src/format/relative'
import { toRFC2822, toRFC3339, toSQL, toSQLDate, toSQLTime } from '../src/format/serializers'
import { EN } from '../src/locale/default'
import { Locales } from '../src/locale/registry'
import type { LocaleData } from '../src/core/types'

// Fixed fake time: Thursday, January 15, 2026, noon UTC
const FAKE_NOW = '2026-01-15T12:00:00.000Z'
const FAKE_MS = new Date(FAKE_NOW).getTime()

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(FAKE_NOW))
  Clock.setTestNow(FAKE_MS)
})

afterEach(() => {
  vi.useRealTimers()
  Clock.setTestNow(null)
})

// ─── B7: unknown month name must invalidate the parse ─────────────────────────
describe('B7: unknown month name is rejected, not silently January', () => {
  test('strict mode: "Floop 15 2024" with MMMM is invalid', () => {
    expect(DateFormat.parse('Floop 15 2024', 'MMMM D YYYY', true).isValid()).toBe(false)
  })

  test('lenient mode: "Floop 15 2024" with MMMM is invalid too', () => {
    expect(DateFormat.parse('Floop 15 2024', 'MMMM D YYYY').isValid()).toBe(false)
  })

  test('lenient mode: unknown short month name with MMM is invalid', () => {
    expect(DateFormat.parse('Flp 15 2024', 'MMM D YYYY').isValid()).toBe(false)
  })

  test('valid month names still parse', () => {
    expect(DateFormat.parse('March 15 2024', 'MMMM D YYYY', true).format('YYYY-MM-DD')).toBe(
      '2024-03-15'
    )
    expect(DateFormat.parse('Mar 15 2024', 'MMM D YYYY', true).format('YYYY-MM-DD')).toBe(
      '2024-03-15'
    )
  })
})

// ─── B10a: calendar() label templates render brackets/L properly ──────────────
describe('B10a: calendarLabel template rendering', () => {
  test('sameDay: no literal brackets in output', () => {
    expect(calendarLabel(0, '9:30 AM', '06/13/2025', 'Friday', EN.calendar)).toBe(
      'Today at 9:30 AM'
    )
  })

  test('lastWeek: "[Last]" is not eaten by L substitution', () => {
    expect(calendarLabel(-3, '3:00 PM', '06/13/2025', 'Friday', EN.calendar)).toBe(
      'Last Friday at 3:00 PM'
    )
  })

  test('nextDay / lastDay / nextWeek with default templates', () => {
    expect(calendarLabel(1.5, '9:30 AM', '06/13/2025', 'Friday')).toBe('Tomorrow at 9:30 AM')
    expect(calendarLabel(-0.5, '9:30 AM', '06/13/2025', 'Friday')).toBe('Yesterday at 9:30 AM')
    expect(calendarLabel(3, '9:30 AM', '06/13/2025', 'Friday')).toBe('Friday at 9:30 AM')
  })

  test('sameElse: "L" template expands to the formatted date', () => {
    expect(calendarLabel(30, '9:30 AM', '06/13/2025', 'Friday', EN.calendar)).toBe('06/13/2025')
  })

  test('custom template using LT long token', () => {
    expect(
      calendarLabel(0, '9:30 AM', '06/13/2025', 'Friday', {
        ...EN.calendar,
        sameDay: '[Today,] L [at] LT'
      })
    ).toBe('Today, 06/13/2025 at 9:30 AM')
  })

  test('DateTime.calendar() same-day output has no brackets', () => {
    const out = new DateFormat(FAKE_MS).calendar()
    expect(out).toMatch(/^Today at \d{1,2}:\d{2} [AP]M$/)
    expect(out).not.toContain('[')
    expect(out).not.toContain(']')
  })
})

// ─── B14: preciseDiff() must not return negative day components ───────────────
describe('B14: preciseDiff borrow logic', () => {
  test('2025-03-01 vs 2025-01-31 → 1 month 1 day (moment-precise-range)', () => {
    const b = new DateFormat('2025-03-01T00:00:00Z')
    const result = b.preciseDiff('2025-01-31T00:00:00Z')
    expect(result.years).toBe(0)
    expect(result.months).toBe(1)
    expect(result.days).toBe(1)
    expect(result.hours).toBe(0)
    expect(result.minutes).toBe(0)
  })

  test('2025-05-01 vs 2025-03-31 → 1 month 1 day', () => {
    const result = new DateFormat('2025-05-01T00:00:00Z').preciseDiff('2025-03-31T00:00:00Z')
    expect(result.months).toBe(1)
    expect(result.days).toBe(1)
  })

  test('2025-03-01 vs 2025-01-15 → 1 month 14 days (regular borrow unchanged)', () => {
    const result = new DateFormat('2025-03-01T00:00:00Z').preciseDiff('2025-01-15T00:00:00Z')
    expect(result.months).toBe(1)
    expect(result.days).toBe(14)
  })

  test('no component is ever negative', () => {
    const pairs: [string, string][] = [
      ['2025-03-01T00:00:00Z', '2025-01-31T00:00:00Z'],
      ['2025-07-31T00:00:00Z', '2025-06-30T00:00:00Z'],
      ['2024-02-29T00:00:00Z', '2023-03-01T00:00:00Z'],
      ['2025-01-01T00:00:30Z', '2024-12-31T23:59:45Z']
    ]
    for (const [b, a] of pairs) {
      const r = new DateFormat(b).preciseDiff(a)
      for (const v of [r.years, r.months, r.days, r.hours, r.minutes, r.seconds, r.milliseconds]) {
        expect(v).toBeGreaterThanOrEqual(0)
      }
    }
  })

  test('preciseFrom() renders the corrected breakdown', () => {
    expect(new DateFormat('2025-03-01T00:00:00Z').preciseFrom('2025-01-31T00:00:00Z')).toBe(
      '1 month, 1 day'
    )
  })

  test('age() components are non-negative', () => {
    const result = new DateFormat('1990-06-15T00:00:00Z').age()
    expect(result.years).toBeGreaterThanOrEqual(0)
    expect(result.months).toBeGreaterThanOrEqual(0)
    expect(result.days).toBeGreaterThanOrEqual(0)
    expect(result.toString()).not.toContain('-')
  })
})

// ─── B15: U+0001 in format strings must not crash format/parse ────────────────
describe('B15: embedded ESC sentinel (U+0001) in format strings', () => {
  const d = new DateFormat('2026-01-15T12:00:00Z')

  test('format("\\u0001") passes the character through', () => {
    expect(() => d.format('\u0001')).not.toThrow()
    expect(d.format('\u0001')).toBe('\u0001')
  })

  test('format with sentinel between bracket literals', () => {
    expect(d.format('[a]\u0001[b]YYYY')).toBe('a\u0001b2026')
  })

  test('format with sentinel adjacent to digits', () => {
    expect(d.format('\u00015\u0001')).toBe('\u00015\u0001')
  })

  test('parse with sentinel in the format treats it as a literal', () => {
    expect(() => DateFormat.parse('\u0001 2024', '\u0001 YYYY')).not.toThrow()
    const parsed = DateFormat.parse('\u0001 2024', '\u0001 YYYY')
    expect(parsed.isValid()).toBe(true)
    expect(parsed.format('YYYY')).toBe('2024')
  })

  test('normal bracket literals still work', () => {
    expect(d.format('[Year] YYYY')).toBe('Year 2026')
  })
})

// ─── B16: strict parse rejects minute/second rollover ─────────────────────────
describe('B16: strict minute/second validation', () => {
  test('strict "10:99" minutes is invalid', () => {
    expect(DateFormat.parse('2024-01-01 10:99', 'YYYY-MM-DD HH:mm', true).isValid()).toBe(false)
  })

  test('strict ":99" seconds is invalid', () => {
    expect(DateFormat.parse('2024-01-01 10:30:99', 'YYYY-MM-DD HH:mm:ss', true).isValid()).toBe(
      false
    )
  })

  test('strict "25" hours stays invalid', () => {
    expect(DateFormat.parse('2024-01-01 25:00', 'YYYY-MM-DD HH:mm', true).isValid()).toBe(false)
  })

  test('strict boundary values 23:59:59 are valid', () => {
    const parsed = DateFormat.parse('2024-01-01 23:59:59', 'YYYY-MM-DD HH:mm:ss', true)
    expect(parsed.isValid()).toBe(true)
    expect(parsed.format('HH:mm:ss')).toBe('23:59:59')
  })

  test('lenient mode still rolls over (10:99 → 11:39)', () => {
    const parsed = DateFormat.parse('2024-01-01 10:99', 'YYYY-MM-DD HH:mm')
    expect(parsed.isValid()).toBe(true)
    expect(parsed.format('HH:mm')).toBe('11:39')
  })
})

// ─── B17: DDD/DDDD parse keeps time-of-day and offset ─────────────────────────
describe('B17: day-of-year parse preserves time and offset', () => {
  test('"2024 100 13:30" keeps the parsed time', () => {
    const parsed = DateFormat.parse('2024 100 13:30', 'YYYY DDD HH:mm')
    expect(parsed.isValid()).toBe(true)
    expect(parsed.format('YYYY-MM-DD HH:mm')).toBe('2024-04-09 13:30')
  })

  test('day-of-year with explicit offset resolves the exact instant', () => {
    const parsed = DateFormat.parse('2024 100 13:30 +02:00', 'YYYY DDD HH:mm Z')
    expect(parsed.valueOf()).toBe(Date.UTC(2024, 3, 9, 11, 30))
  })

  test('DDDD (zero-padded) resolves the same date', () => {
    expect(DateFormat.parse('2024 100', 'YYYY DDDD').format('YYYY-MM-DD')).toBe('2024-04-09')
  })

  test('non-leap year day 100 → April 10', () => {
    expect(DateFormat.parse('2023 100 08:15', 'YYYY DDD HH:mm').format('YYYY-MM-DD HH:mm')).toBe(
      '2023-04-10 08:15'
    )
  })
})

// ─── B19: Duration.format() for negative durations ────────────────────────────
describe('B19: negative Duration.format()', () => {
  test('-90 minutes → "-01:30"', () => {
    expect(Duration.of(-90, 'minute').format('HH:mm')).toBe('-01:30')
  })

  test('negative with seconds and millis', () => {
    expect(new Duration(-(1 * 3_600_000 + 30 * 60_000 + 5_000 + 42)).format('HH:mm:ss.SSS')).toBe(
      '-01:30:05.042'
    )
  })

  test('positive durations are unchanged', () => {
    expect(Duration.of(90, 'minute').format('HH:mm')).toBe('01:30')
  })

  test('zero duration has no sign', () => {
    expect(new Duration(0).format('HH:mm')).toBe('00:00')
  })

  test('sign handling matches humanize (magnitude on absolute value)', () => {
    expect(Duration.of(-90, 'minute').humanize()).toBe('1 hour, 30 minutes')
  })
})

// ─── B21: serializers respect UTC mode ────────────────────────────────────────
describe('B21: serializers honor the utc flag', () => {
  const instant = new Date('2026-01-15T12:00:00Z')

  test('toSQL/toSQLDate/toSQLTime in UTC mode render UTC wall-clock', () => {
    expect(toSQL(instant, true)).toBe('2026-01-15 12:00:00')
    expect(toSQLDate(instant, true)).toBe('2026-01-15')
    expect(toSQLTime(instant, true)).toBe('12:00:00')
  })

  test('toRFC3339 in UTC mode renders Z', () => {
    expect(toRFC3339(instant, true)).toBe('2026-01-15T12:00:00Z')
  })

  test('toRFC2822 in UTC mode renders +0000', () => {
    expect(toRFC2822(instant, true)).toBe('Thu, 15 Jan 2026 12:00:00 +0000')
  })

  test('UTC serialization agrees with a UTC-mode instance format()', () => {
    const u = new DateFormat(instant, { utc: true })
    expect(toSQL(instant, true)).toBe(u.format('YYYY-MM-DD HH:mm:ss'))
    expect(toSQLDate(instant, true)).toBe(u.format('YYYY-MM-DD'))
    expect(toSQLTime(instant, true)).toBe(u.format('HH:mm:ss'))
  })

  test('default (local) serialization agrees with a local-mode instance format()', () => {
    const l = new DateFormat(instant.getTime())
    expect(toSQL(instant)).toBe(l.format('YYYY-MM-DD HH:mm:ss'))
    expect(toSQLDate(instant)).toBe(l.format('YYYY-MM-DD'))
    expect(toSQLTime(instant)).toBe(l.format('HH:mm:ss'))
  })
})

// ─── B22: negative-year YYYY formatting ───────────────────────────────────────
describe('B22: negative year formats as -0005', () => {
  test('year -5 → "-0005"', () => {
    const d = new DateFormat(new Date(Date.UTC(-5, 5, 15)), { utc: true })
    expect(d.format('YYYY')).toBe('-0005')
  })

  test('year -950 → "-0950"', () => {
    const d = new DateFormat(new Date(Date.UTC(-950, 0, 1)), { utc: true })
    expect(d.format('YYYY')).toBe('-0950')
  })

  test('small positive years still zero-pad', () => {
    const d = new DateFormat(new Date(Date.UTC(987, 0, 1)), { utc: true })
    expect(d.format('YYYY')).toBe('0987')
  })
})

// ─── T: built-in EN locale completeness guard ─────────────────────────────────
describe('T: EN locale provides every LocaleData field', () => {
  const REQUIRED_LOCALE_KEYS = [
    'calendar',
    'longDateFormat',
    'meridiem',
    'months',
    'monthsShort',
    'name',
    'ordinal',
    'relativeTime',
    'weekdays',
    'weekdaysMin',
    'weekdaysShort',
    'weekStart'
  ] as const satisfies readonly (keyof LocaleData)[]

  // Compile-time completeness: fails to build if LocaleData gains a key
  // that is missing from the literal list above.
  type MissingKeys = Exclude<keyof LocaleData, (typeof REQUIRED_LOCALE_KEYS)[number]>
  const _assertNoMissingKeys: [MissingKeys] extends [never] ? true : MissingKeys = true
  void _assertNoMissingKeys

  test('EN defines every LocaleData field (Required<LocaleData> cast is safe)', () => {
    for (const key of REQUIRED_LOCALE_KEYS) {
      expect(EN[key], `EN.${key}`).not.toBeNull()
      expect(EN[key], `EN.${key}`).not.toBeUndefined()
    }
  })

  test('resolved default locale exposes fully-populated fields', () => {
    const resolved = Locales.get('en')
    for (const value of Object.values(resolved)) {
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
    }
  })
})
