// ─────────────────────────────────────────────────────────────────────────────
// Regression tests for audited core defects (B5, B6, B10b, B11, B12, B13,
// B18, B23, B24, B25) and the type-quality fixes (T1, T2, T4, T5).
// Each test reproduces the exact audited scenario.
// ─────────────────────────────────────────────────────────────────────────────

import { afterEach, describe, expect, test, vi } from 'vitest'
import { DateTime } from '../src/index'
import type { DateTimeLike } from '../src/index'

const ORIGINAL_TZ = process.env.TZ

function setTZ(zone: string): void {
  process.env.TZ = zone
}

function restoreTZ(): void {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ
  else process.env.TZ = ORIGINAL_TZ
}

afterEach(() => {
  restoreTZ()
  DateTime.setTestNow(null)
  vi.restoreAllMocks()
})

// ─── B5: startOf('quarter') on day-of-month > target month length ────────────
describe('B5: startOf/endOf/floor quarter from May 31', () => {
  test('startOf quarter of 2025-05-31T12:00Z → 2025-04-01 (not May 1)', () => {
    const d = new DateTime('2025-05-31T12:00:00Z')
    expect(d.startOf('quarter').toISOString()).toBe('2025-04-01T00:00:00.000Z')
  })

  test('endOf quarter of 2025-05-31T12:00Z → 2025-06-30T23:59:59.999Z', () => {
    const d = new DateTime('2025-05-31T12:00:00Z')
    expect(d.endOf('quarter').toISOString()).toBe('2025-06-30T23:59:59.999Z')
  })

  test('floor and firstOf quarter agree with startOf', () => {
    const d = new DateTime('2025-05-31T12:00:00Z')
    expect(d.floor('quarter').toISOString()).toBe('2025-04-01T00:00:00.000Z')
    const first = d.firstOf('quarter')
    expect(first.get('month')).toBe(4)
    expect(first.get('date')).toBe(1)
  })

  test('local-mode startOf quarter from the 31st is correct', () => {
    const d = new DateTime(new Date(2025, 4, 31, 12, 0, 0))
    const s = d.startOf('quarter')
    expect(s.get('month')).toBe(4)
    expect(s.get('date')).toBe(1)
    expect(s.get('hour')).toBe(0)
  })

  test('startOf year from Dec 31 stays in the same year', () => {
    const d = new DateTime('2025-12-31T12:00:00Z')
    expect(d.startOf('year').toISOString()).toBe('2025-01-01T00:00:00.000Z')
  })
})

// ─── B6: round() snaps to calendar boundaries, not the UTC-epoch grid ────────
describe('B6: calendar-aware round / roundTo', () => {
  test('round week snaps to the week start (Sunday), not the epoch Thursday grid', () => {
    // Wednesday 13:00 — closer to next Sunday than to the previous one
    const wed = new DateTime('2025-05-14T13:00:00Z')
    expect(wed.round('week').toISOString()).toBe('2025-05-18T00:00:00.000Z')
    expect(wed.round('week').get('day')).toBe(0)
    // Monday — closer to the previous Sunday
    const mon = new DateTime('2025-05-12T09:00:00Z')
    expect(mon.round('week').toISOString()).toBe('2025-05-11T00:00:00.000Z')
  })

  test('round day picks the nearer local midnight in a +05:45 zone', () => {
    setTZ('Asia/Kathmandu')
    const afternoon = new DateTime(new Date(2025, 4, 14, 13, 0, 0))
    const rounded = afternoon.round('day')
    expect(rounded.get('date')).toBe(15)
    expect(rounded.get('hour')).toBe(0)
    expect(rounded.get('minute')).toBe(0)
    const morning = new DateTime(new Date(2025, 4, 14, 11, 0, 0))
    const down = morning.round('day')
    expect(down.get('date')).toBe(14)
    expect(down.get('hour')).toBe(0)
  })

  test('round hour of local 13:40 in +05:45 → 14:00 (not 13:45)', () => {
    setTZ('Asia/Kathmandu')
    const d = new DateTime(new Date(2025, 4, 14, 13, 40, 0))
    const r = d.round('hour')
    expect(r.get('hour')).toBe(14)
    expect(r.get('minute')).toBe(0)
  })

  test('roundTo stays anchored to the local day start', () => {
    setTZ('Asia/Kathmandu')
    const d = new DateTime(new Date(2025, 4, 14, 13, 40, 0))
    const q = d.roundTo(15, 'minute')
    expect(q.get('hour')).toBe(13)
    expect(q.get('minute')).toBe(45)
    const h = d.roundTo(6, 'hour')
    expect(h.get('hour')).toBe(12)
    expect(h.get('minute')).toBe(0)
  })

  test('roundTo in UTC mode: 13:40 to nearest 15 minutes → 13:45', () => {
    const d = new DateTime('2025-05-14T13:40:00Z')
    expect(d.roundTo(15, 'minute').toISOString()).toBe('2025-05-14T13:45:00.000Z')
  })

  test('roundTo rejects calendar units at compile time and runtime', () => {
    const d = new DateTime('2025-05-14T13:40:00Z')
    // @ts-expect-error month is not a fixed-size sub-day unit
    expect(() => d.roundTo(2, 'month')).toThrow(RangeError)
  })
})

// ─── B10b: calendar() with mixed utc/local modes ─────────────────────────────
describe('B10b: calendar() compares calendar days consistently', () => {
  test('a utc-mode instant of today is labeled Today, not Yesterday', () => {
    setTZ('Asia/Kathmandu')
    DateTime.setTestNow('2026-07-23T10:00:00Z')
    const target = DateTime.now().utc()
    expect(target.calendar()).toMatch(/today/i)
  })

  test('utc-mode instant of the previous utc day is labeled Yesterday', () => {
    setTZ('Asia/Kathmandu')
    DateTime.setTestNow('2026-07-23T10:00:00Z')
    const target = DateTime.now().utc().subtract(1, 'day')
    expect(target.calendar()).toMatch(/yesterday/i)
  })
})

// ─── B11: years 0000-0999 parse to the correct century ───────────────────────
describe('B11: early-year ISO strings', () => {
  test('0099-01-31 parses to year 99, not 1999', () => {
    const d = new DateTime('0099-01-31')
    expect(d.isValid()).toBe(true)
    expect(d.get('year')).toBe(99)
    expect(d.get('month')).toBe(1)
    expect(d.get('date')).toBe(31)
    expect(d.toISOString().startsWith('0099-01-31T00:00:00')).toBe(true)
  })

  test('0001-01-01 and 0500-06-15T12:30 parse exactly', () => {
    expect(new DateTime('0001-01-01').get('year')).toBe(1)
    const d = new DateTime('0500-06-15T12:30')
    expect(d.get('year')).toBe(500)
    expect(d.get('hour')).toBe(12)
    expect(d.get('minute')).toBe(30)
  })

  test('0099-01-31T12:00:00Z (explicit Z) parses to year 99', () => {
    const d = new DateTime('0099-01-31T12:00:00Z')
    expect(d.get('year')).toBe(99)
    expect(d.get('hour')).toBe(12)
  })

  test('4-digit-year strings are unchanged', () => {
    expect(new DateTime('2026-01-15').toISOString()).toBe('2026-01-15T00:00:00.000Z')
    expect(new DateTime('2026-01-15T12:34:56.789Z').toISOString()).toBe('2026-01-15T12:34:56.789Z')
  })

  test('out-of-range fields stay invalid (no silent rollover)', () => {
    expect(new DateTime('2025-13-01').isValid()).toBe(false)
    expect(new DateTime('2025-02-30').isValid()).toBe(false)
    expect(new DateTime('2025-06-18T25:00').isValid()).toBe(false)
  })
})

// ─── B12: dayOfYear across a DST spring-forward ──────────────────────────────
describe('B12: dayOfYear is DST-immune', () => {
  test('early-morning local times after spring-forward are not off by one', () => {
    setTZ('America/New_York') // DST began 2025-03-09 02:00
    const d = new DateTime(new Date(2025, 2, 10, 0, 30, 0))
    expect(d.dayOfYear()).toBe(69) // Mar 10 = 31 + 28 + 10
    const sameDayNoon = new DateTime(new Date(2025, 2, 9, 12, 0, 0))
    expect(sameDayNoon.dayOfYear()).toBe(68)
    const yearEnd = new DateTime(new Date(2025, 11, 31, 0, 30, 0))
    expect(yearEnd.dayOfYear()).toBe(365)
  })

  test('utc mode is unchanged', () => {
    expect(new DateTime('2025-12-31').dayOfYear()).toBe(365)
    expect(new DateTime('2025-01-01').dayOfYear()).toBe(1)
  })
})

// ─── B13: isDST() in zones that never observe DST ────────────────────────────
describe('B13: isDST', () => {
  test('constant-offset zone → false year-round (mocked offset)', () => {
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(300)
    const d = new DateTime(Date.UTC(2025, 6, 1)).local()
    expect(d.isDST()).toBe(false)
  })

  test('no-DST IANA zone → false in both January and July', () => {
    setTZ('Asia/Kathmandu')
    expect(new DateTime(new Date(2025, 0, 15)).isDST()).toBe(false)
    expect(new DateTime(new Date(2025, 6, 15)).isDST()).toBe(false)
  })

  test('DST-observing zone → true only in summer (northern hemisphere)', () => {
    setTZ('America/New_York')
    expect(new DateTime(new Date(2025, 6, 15)).isDST()).toBe(true)
    expect(new DateTime(new Date(2025, 0, 15)).isDST()).toBe(false)
  })
})

// ─── B18: set('month') clamps the day-of-month ───────────────────────────────
describe('B18: set month clamps day-of-month', () => {
  test('Jan 31 set to February → Feb 28 (not Mar 3)', () => {
    const d = new DateTime('2025-01-31T12:00:00Z').set('month', 2)
    expect(d.get('month')).toBe(2)
    expect(d.get('date')).toBe(28)
    expect(d.get('year')).toBe(2025)
    expect(d.get('hour')).toBe(12)
  })

  test('leap year clamps to Feb 29', () => {
    const d = new DateTime('2024-01-31T00:00:00Z').set('month', 2)
    expect(d.get('month')).toBe(2)
    expect(d.get('date')).toBe(29)
  })

  test('local mode: May 31 set to April → April 30', () => {
    const d = new DateTime(new Date(2025, 4, 31, 8, 0, 0)).set('month', 4)
    expect(d.get('month')).toBe(4)
    expect(d.get('date')).toBe(30)
    expect(d.get('hour')).toBe(8)
  })

  test('days that fit are not clamped', () => {
    const d = new DateTime('2025-01-15T00:00:00Z').set('month', 2)
    expect(d.get('month')).toBe(2)
    expect(d.get('date')).toBe(15)
  })
})

// ─── B23: fractional add amounts ─────────────────────────────────────────────
describe('B23: fractional add', () => {
  const base = new DateTime('2025-01-01T00:00:00Z')

  test('add(0.5, "day") advances 12 hours (was a silent no-op)', () => {
    expect(base.add(0.5, 'day').toISOString()).toBe('2025-01-01T12:00:00.000Z')
  })

  test('add(1.5, "day") = 1 calendar day + 12 hours', () => {
    expect(base.add(1.5, 'day').toISOString()).toBe('2025-01-02T12:00:00.000Z')
  })

  test('add(-0.5, "day") goes back 12 hours', () => {
    expect(base.add(-0.5, 'day').toISOString()).toBe('2024-12-31T12:00:00.000Z')
  })

  test('add(0.5, "week") advances 3.5 days', () => {
    expect(base.add(0.5, 'week').toISOString()).toBe('2025-01-04T12:00:00.000Z')
  })

  test('variable-length units round to whole months (moment behavior)', () => {
    expect(base.add(0.5, 'month').toISOString()).toBe('2025-02-01T00:00:00.000Z')
    expect(base.add(1.4, 'month').toISOString()).toBe('2025-02-01T00:00:00.000Z')
    expect(base.add(0.5, 'year').toISOString()).toBe('2025-07-01T00:00:00.000Z')
    expect(base.add(0.25, 'year').toISOString()).toBe('2025-04-01T00:00:00.000Z')
    expect(base.add(-0.5, 'year').toISOString()).toBe('2024-07-01T00:00:00.000Z')
  })

  test('sub-day fractions still work', () => {
    expect(base.add(1.5, 'hour').toISOString()).toBe('2025-01-01T01:30:00.000Z')
  })

  test('integer amounts are unaffected', () => {
    expect(base.add(1, 'month').toISOString()).toBe('2025-02-01T00:00:00.000Z')
    expect(base.add(2, 'day').toISOString()).toBe('2025-01-03T00:00:00.000Z')
  })
})

// ─── B24: ISO datetime without seconds is UTC ────────────────────────────────
describe('B24: minute-precision ISO strings are UTC', () => {
  test('"2025-06-18T09:30" is treated as a UTC instant', () => {
    const d = new DateTime('2025-06-18T09:30')
    expect(d.isUtc()).toBe(true)
    expect(d.toISOString()).toBe('2025-06-18T09:30:00.000Z')
  })

  test('with-seconds and fractional-second variants agree', () => {
    expect(new DateTime('2025-06-18T09:30:15').toISOString()).toBe('2025-06-18T09:30:15.000Z')
    expect(new DateTime('2025-06-18T09:30:15.25').toISOString()).toBe('2025-06-18T09:30:15.250Z')
  })
})

// ─── B25: century / millennium boundary years ────────────────────────────────
describe('B25: century and millennium are ceil(year/n)', () => {
  test('year 2000 is the 20th century and 2nd millennium', () => {
    const d = new DateTime('2000-06-01T00:00:00Z')
    expect(d.get('century')).toBe(20)
    expect(d.get('millennium')).toBe(2)
  })

  test('year 2001 starts the 21st century and 3rd millennium', () => {
    const d = new DateTime('2001-01-01T00:00:00Z')
    expect(d.get('century')).toBe(21)
    expect(d.get('millennium')).toBe(3)
  })

  test('years 1999 and 2100', () => {
    expect(new DateTime('1999-12-31T00:00:00Z').get('century')).toBe(20)
    expect(new DateTime('2100-12-31T00:00:00Z').get('century')).toBe(21)
    expect(new DateTime('1999-12-31T00:00:00Z').get('millennium')).toBe(2)
  })
})

// ─── T1/T2: narrowed unit types throw instead of silently misbehaving ────────
describe('T1/T2: non-boundary and non-settable units', () => {
  test('startOf("decade") throws RangeError (previously returned now)', () => {
    const d = new DateTime('2025-05-14T13:00:00Z')
    // @ts-expect-error decade has no calendar boundary
    expect(() => d.startOf('decade')).toThrow(RangeError)
    // @ts-expect-error fortnight has no calendar boundary
    expect(() => d.round('fortnight')).toThrow(RangeError)
  })

  test('set("week") is rejected', () => {
    const d = new DateTime('2025-05-14T13:00:00Z')
    // @ts-expect-error week is not a settable field
    expect(() => d.set('week', 2)).toThrow(RangeError)
  })

  test('isoWeek boundaries still work', () => {
    const d = new DateTime('2025-05-14T13:00:00Z')
    expect(d.startOf('isoWeek').get('day')).toBe(1)
    expect(d.endOf('isoWeek').get('day')).toBe(0)
  })
})

// ─── T4: structural DateTimeLike constructor input ───────────────────────────
describe('T4: DateTimeLike inputs', () => {
  const ms = 1750000000000
  const like: DateTimeLike = {
    valueOf: () => ms,
    isUtc: () => true,
    isValid: () => true,
    clone(): DateTimeLike {
      return this
    },
    get: () => 0,
    toDate: () => new Date(ms)
  }

  test('wraps the instant instead of stringifying to "[object Object]"', () => {
    const d = new DateTime(like, { utc: true })
    expect(d.isValid()).toBe(true)
    expect(d.valueOf()).toBe(ms)
    expect(d.isUtc()).toBe(true)
  })

  test('honors like.isUtc() when opts.utc is unspecified', () => {
    expect(new DateTime(like).isUtc()).toBe(true)
    expect(new DateTime(like, { utc: false }).isUtc()).toBe(false)
  })
})

// ─── T5: parse() with no input ───────────────────────────────────────────────
describe('T5: parse without input', () => {
  test('parse() and parse(undefined) both mean "now"', () => {
    DateTime.setTestNow('2026-07-23T10:00:00Z')
    expect(DateTime.parse().valueOf()).toBe(Date.parse('2026-07-23T10:00:00Z'))
    expect(DateTime.parse(undefined).valueOf()).toBe(Date.parse('2026-07-23T10:00:00Z'))
  })
})
