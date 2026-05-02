import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import DateFormat from '../src/core/DateTime'
import Duration from '../src/core/Duration'
import { Clock } from '../src/core/Clock'

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

// ─── Constructor ──────────────────────────────────────────────────────────────
describe('Constructor', () => {
  test('no args → valid, uses Date.now', () => {
    const d = new DateFormat()
    expect(d.isValid()).toBe(true)
    expect(d.valueOf()).toBe(FAKE_MS)
  })

  test('ISO date string → UTC mode', () => {
    const d = new DateFormat('2026-01-15')
    expect(d.isValid()).toBe(true)
    expect(d.isUtc()).toBe(true)
  })

  test('ISO datetime string → UTC mode', () => {
    const d = new DateFormat('2026-01-15T12:00:00')
    expect(d.isValid()).toBe(true)
    expect(d.isUtc()).toBe(true)
  })

  test('string ending in Z → UTC, slices Z', () => {
    const d = new DateFormat('2026-01-15T12:00:00Z')
    expect(d.isUtc()).toBe(true)
    expect(d.get('year')).toBe(2026)
    expect(d.get('month')).toBe(1)
    expect(d.get('date')).toBe(15)
  })

  test('string with offset → local mode', () => {
    const d = new DateFormat('2026-01-15T12:00:00+05:30')
    expect(d.isLocal()).toBe(true)
    expect(d.isValid()).toBe(true)
  })

  test('number → valid', () => {
    const d = new DateFormat(FAKE_MS)
    expect(d.isValid()).toBe(true)
    expect(d.valueOf()).toBe(FAKE_MS)
  })

  test('Date object → valid', () => {
    const date = new Date(FAKE_MS)
    const d = new DateFormat(date)
    expect(d.isValid()).toBe(true)
    expect(d.valueOf()).toBe(FAKE_MS)
  })

  test('DateFormat clone → copies utc flag', () => {
    const original = new DateFormat('2026-01-15T12:00:00Z')
    expect(original.isUtc()).toBe(true)
    const clone = new DateFormat(original)
    expect(clone.isUtc()).toBe(true)
    expect(clone.valueOf()).toBe(original.valueOf())
  })

  test('NaN → !isValid()', () => {
    const d = new DateFormat(NaN)
    expect(d.isValid()).toBe(false)
  })

  test('invalid string → !isValid()', () => {
    const d = new DateFormat('invalid string')
    expect(d.isValid()).toBe(false)
  })

  test('opts.utc true with number → UTC mode', () => {
    const d = new DateFormat(FAKE_MS, { utc: true })
    expect(d.isUtc()).toBe(true)
    expect(d.valueOf()).toBe(FAKE_MS)
  })

  test('string with utc option and no Z/offset → appends Z internally', () => {
    const d = new DateFormat('2026-01-15T12:00:00', { utc: true })
    expect(d.isUtc()).toBe(true)
    expect(d.get('year')).toBe(2026)
    expect(d.get('hour')).toBe(12)
  })
})

// ─── Static: parse() ─────────────────────────────────────────────────────────
describe('DateFormat.parse()', () => {
  test('no args → returns valid DateFormat (defaults to "now")', () => {
    const parseNoArgs = DateFormat.parse as (input?: string) => DateFormat
    const d = parseNoArgs()
    expect(d.isValid()).toBe(true)
  })

  test('fmt with no recognized tokens → invalid', () => {
    const d = DateFormat.parse('DT', 'DT')
    expect(d.isValid()).toBe(false)
  })

  test('no fmt → falls back to constructor', () => {
    const d = DateFormat.parse('2026-01-15')
    expect(d.isValid()).toBe(true)
    expect(d.get('year')).toBe(2026)
  })

  test('no fmt, ends with Z → UTC', () => {
    const d = DateFormat.parse('2026-01-15T12:00:00Z')
    expect(d.isUtc()).toBe(true)
    expect(d.get('year')).toBe(2026)
  })

  test('with fmt YYYY-MM-DD → parses correctly', () => {
    const d = DateFormat.parse('2026-03-25', 'YYYY-MM-DD')
    expect(d.isValid()).toBe(true)
    expect(d.get('year')).toBe(2026)
    expect(d.get('month')).toBe(3)
    expect(d.get('date')).toBe(25)
  })

  test('with fmt YYYY-MM-DD HH:mm:ss → parses with time (local components round-trip)', () => {
    const d = DateFormat.parse('2026-06-10 14:30:45', 'YYYY-MM-DD HH:mm:ss')
    expect(d.isValid()).toBe(true)
    // The instance is in local mode; reading the same components returns what was parsed.
    expect(d.get('hour')).toBe(14)
    expect(d.get('minute')).toBe(30)
    expect(d.get('second')).toBe(45)
  })

  test('non-matching → !isValid()', () => {
    const d = DateFormat.parse('not-a-date', 'YYYY-MM-DD')
    expect(d.isValid()).toBe(false)
  })

  test('strict=true, date-only → local midnight (no UTC)', () => {
    const d = DateFormat.parse('2026-01-15', 'YYYY-MM-DD', true)
    expect(d.isLocal()).toBe(true)
  })

  test('strict=true, invalid month (13) → !isValid()', () => {
    const d = DateFormat.parse('2026-13-01', 'YYYY-MM-DD', true)
    expect(d.isValid()).toBe(false)
  })

  test('strict=true, invalid month (0) → !isValid()', () => {
    const d = DateFormat.parse('2026-00-01', 'YYYY-MM-DD', true)
    expect(d.isValid()).toBe(false)
  })

  test('strict=true, invalid day > daysInMonth → !isValid()', () => {
    const d = DateFormat.parse('2026-01-32', 'YYYY-MM-DD', true)
    expect(d.isValid()).toBe(false)
  })

  test('strict=true, no MM token → mm is null (skip month check)', () => {
    const d = DateFormat.parse('2026', 'YYYY', true)
    expect(d.isValid()).toBe(true)
  })

  test('strict=true, no DD token → dd is null (skip day check)', () => {
    const d = DateFormat.parse('2026-05', 'YYYY-MM', true)
    expect(d.isValid()).toBe(true)
  })

  test('strict=true, DD present but MM absent → mm=null uses mm??1 fallback', () => {
    // Format YYYY-DD has day but no month; mm=null → mm??1=1 used for dim calculation
    const d = DateFormat.parse('2026-05', 'YYYY-DD', true)
    expect(d.isValid()).toBe(true)
  })

  test('strict=true, DD only (no YYYY) → parts.YYYY||1970 fallback used', () => {
    // Format DD: no YYYY → parts.YYYY is null → parts.YYYY||1970 = 1970 for dim calc
    const d = DateFormat.parse('05', 'DD', true)
    expect(d.isValid()).toBe(true)
  })

  test('strict=true, invalid day (0) → !isValid()', () => {
    const d = DateFormat.parse('2026-01-00', 'YYYY-MM-DD', true)
    expect(d.isValid()).toBe(false)
  })

  test('Unix ms x token', () => {
    const d = DateFormat.parse(String(FAKE_MS), 'x')
    expect(d.isValid()).toBe(true)
    expect(d.valueOf()).toBe(FAKE_MS)
  })

  test('Unix sec X token', () => {
    const sec = Math.floor(FAKE_MS / 1000)
    const d = DateFormat.parse(String(sec), 'X')
    expect(d.isValid()).toBe(true)
    expect(d.valueOf()).toBe(sec * 1000)
  })

  test('with Z token, positive offset +05:30', () => {
    const d = DateFormat.parse('2026-01-15T12:00:00+05:30', 'YYYY-MM-DDTHH:mm:ssZ')
    expect(d.isValid()).toBe(true)
  })

  test('with Z token, negative offset -05:00', () => {
    const d = DateFormat.parse('2026-01-15T12:00:00-05:00', 'YYYY-MM-DDTHH:mm:ssZ')
    expect(d.isValid()).toBe(true)
  })

  test('with Z token = Z (UTC)', () => {
    const d = DateFormat.parse('2026-01-15T12:00:00Z', 'YYYY-MM-DDTHH:mm:ssZ')
    expect(d.isValid()).toBe(true)
    expect(d.isUtc()).toBe(true)
  })
})

// ─── Static: min(), max(), duration(), locale(), use() ────────────────────────
describe('Static helpers', () => {
  test('min() returns earliest date', () => {
    const a = new DateFormat('2026-01-01')
    const b = new DateFormat('2026-06-01')
    const c = new DateFormat('2025-12-01')
    const result = DateFormat.min(a, b, c)
    expect(result.get('year')).toBe(2025)
  })

  test('max() returns latest date', () => {
    const a = new DateFormat('2026-01-01')
    const b = new DateFormat('2026-06-01')
    const c = new DateFormat('2025-12-01')
    const result = DateFormat.max(a, b, c)
    expect(result.get('month')).toBe(6)
  })

  test('duration() returns Duration instance', () => {
    const dur = DateFormat.duration(2, 'hour')
    expect(dur).toBeInstanceOf(Duration)
    expect(dur.valueOf()).toBe(2 * 3_600_000)
  })

  test('duration() with unknown unit throws RangeError', () => {
    expect(() =>
      // @ts-expect-error testing invalid unit
      DateFormat.duration(5, 'microsecond')
    ).toThrow(/Unknown unit/)
  })

  test('locale() returns the active locale name (no switch when arg unknown)', () => {
    // The new locale() static getter/setter only switches to *registered* locales;
    // calling it with no arg returns the current default.
    const current = DateFormat.locale()
    expect(typeof current).toBe('string')
  })

  test('use() calls plugin function', () => {
    let called = false
    DateFormat.use(() => {
      called = true
    })
    expect(called).toBe(true)
  })
})

// ─── Core instance ────────────────────────────────────────────────────────────
describe('Core instance methods', () => {
  const d = new DateFormat('2026-01-15T12:00:00Z')

  test('valueOf() → ms', () => {
    expect(d.valueOf()).toBe(new Date('2026-01-15T12:00:00Z').getTime())
  })

  test('unix() → floor seconds', () => {
    expect(d.unix()).toBe(Math.floor(d.valueOf() / 1000))
  })

  test('isValid() → true for valid date', () => {
    expect(d.isValid()).toBe(true)
  })

  test('isValid() → false for invalid date', () => {
    expect(new DateFormat(NaN).isValid()).toBe(false)
  })

  test('isUtc() → true when UTC', () => {
    expect(d.isUtc()).toBe(true)
  })

  test('isLocal() → true when local', () => {
    const local = new DateFormat(FAKE_MS)
    expect(local.isLocal()).toBe(true)
  })

  test('isDST() → false for UTC instance', () => {
    expect(d.isDST()).toBe(false)
  })

  test('isDST() for local instance returns boolean', () => {
    const local = new DateFormat(FAKE_MS)
    expect(typeof local.isDST()).toBe('boolean')
  })

  test('clone() returns equal but different object', () => {
    const cloned = d.clone()
    expect(cloned.valueOf()).toBe(d.valueOf())
    expect(cloned).not.toBe(d)
  })

  test('toDate() → Date instance', () => {
    expect(d.toDate()).toBeInstanceOf(Date)
    expect(d.toDate().getTime()).toBe(d.valueOf())
  })

  test('toISOString() → ISO string', () => {
    expect(d.toISOString()).toBe('2026-01-15T12:00:00.000Z')
  })

  test('toJSON() → same as toISOString()', () => {
    expect(d.toJSON()).toBe(d.toISOString())
  })

  test('toObject() → all fields (uses "day" key, not "date")', () => {
    const obj = d.toObject()
    expect(obj).toHaveProperty('year', 2026)
    expect(obj).toHaveProperty('month', 1)
    expect(obj).toHaveProperty('day', 15)
    expect(obj).toHaveProperty('hour', 12)
    expect(obj).toHaveProperty('minute', 0)
    expect(obj).toHaveProperty('second', 0)
    expect(obj).toHaveProperty('millisecond', 0)
  })
})

// ─── Day of week checks ───────────────────────────────────────────────────────
describe('Day of week checks', () => {
  // 2026-01-11 = Sunday
  const sun = new DateFormat('2026-01-11')
  // 2026-01-12 = Monday
  const mon = new DateFormat('2026-01-12')
  // 2026-01-13 = Tuesday
  const tue = new DateFormat('2026-01-13')
  // 2026-01-14 = Wednesday
  const wed = new DateFormat('2026-01-14')
  // 2026-01-15 = Thursday
  const thu = new DateFormat('2026-01-15')
  // 2026-01-16 = Friday
  const fri = new DateFormat('2026-01-16')
  // 2026-01-17 = Saturday
  const sat = new DateFormat('2026-01-17')

  test('isSunday() on Sunday', () => expect(sun.isSunday()).toBe(true))
  test('isSunday() on non-Sunday', () => expect(mon.isSunday()).toBe(false))
  test('isMonday()', () => expect(mon.isMonday()).toBe(true))
  test('isTuesday()', () => expect(tue.isTuesday()).toBe(true))
  test('isWednesday()', () => expect(wed.isWednesday()).toBe(true))
  test('isThursday()', () => expect(thu.isThursday()).toBe(true))
  test('isFriday()', () => expect(fri.isFriday()).toBe(true))
  test('isSaturday()', () => expect(sat.isSaturday()).toBe(true))

  test('isWeekday() Mon-Fri → true', () => {
    expect(mon.isWeekday()).toBe(true)
    expect(tue.isWeekday()).toBe(true)
    expect(wed.isWeekday()).toBe(true)
    expect(thu.isWeekday()).toBe(true)
    expect(fri.isWeekday()).toBe(true)
  })

  test('isWeekday() Sun/Sat → false', () => {
    expect(sun.isWeekday()).toBe(false)
    expect(sat.isWeekday()).toBe(false)
  })

  test('isWeekend() Sun/Sat → true', () => {
    expect(sun.isWeekend()).toBe(true)
    expect(sat.isWeekend()).toBe(true)
  })

  test('isWeekend() weekday → false', () => {
    expect(mon.isWeekend()).toBe(false)
    expect(fri.isWeekend()).toBe(false)
  })
})

// ─── is* temporal checks ──────────────────────────────────────────────────────
// Fake time: 2026-01-15T12:00:00.000Z (Thursday, Jan 2026, week 3, Q1)
describe('Temporal is* checks', () => {
  // Derive test inputs from the (mocked) "now" so UTC/local construction modes
  // match across the comparand and DateTime.now() — otherwise `isSame(_, 'year')`
  // can drift across timezones.
  const now = () => DateFormat.now()

  describe('Year', () => {
    test('isCurrentYear() / isNextYear() / isLastYear()', () => {
      expect(now().isCurrentYear()).toBe(true)
      expect(now().add(1, 'year').isNextYear()).toBe(true)
      expect(now().subtract(1, 'year').isLastYear()).toBe(true)
      expect(now().add(1, 'year').isCurrentYear()).toBe(false)
    })

    test('isSameYear()', () => {
      const current = now()
      expect(current.isSameYear(current.add(1, 'month'))).toBe(true)
      expect(current.isSameYear(current.add(1, 'year'))).toBe(false)
    })
  })

  describe('Month', () => {
    test('isCurrentMonth() / isNextMonth() / isLastMonth()', () => {
      expect(now().isCurrentMonth()).toBe(true)
      expect(now().add(1, 'month').isNextMonth()).toBe(true)
      expect(now().subtract(1, 'month').isLastMonth()).toBe(true)
    })

    test('isSameMonth()', () => {
      const current = now()
      expect(current.isSameMonth(current.add(1, 'day'))).toBe(true)
      expect(current.isSameMonth(current.add(1, 'month'))).toBe(false)
    })
  })

  describe('Week', () => {
    test('isCurrentWeek() / isNextWeek() / isLastWeek()', () => {
      expect(now().isCurrentWeek()).toBe(true)
      expect(now().add(1, 'week').isNextWeek()).toBe(true)
      expect(now().subtract(1, 'week').isLastWeek()).toBe(true)
    })

    test('isSameWeek()', () => {
      const current = now()
      // 8 days apart → guaranteed different week regardless of week-start convention.
      expect(current.isSameWeek(current.add(8, 'day'))).toBe(false)
    })
  })

  describe('Day-of-instance comparisons', () => {
    test('isSameDay()', () => {
      const a = new DateFormat('2026-01-15T08:00:00Z')
      const b = new DateFormat('2026-01-15T20:00:00Z')
      const c = new DateFormat('2026-01-16T08:00:00Z')
      expect(a.isSameDay(b)).toBe(true)
      expect(a.isSameDay(c)).toBe(false)
    })

    test('isToday() / isTomorrow() / isYesterday()', () => {
      expect(now().isToday()).toBe(true)
      expect(now().add(1, 'day').isTomorrow()).toBe(true)
      expect(now().subtract(1, 'day').isYesterday()).toBe(true)
    })
  })

  describe('Hour / Minute / Second isSame', () => {
    const a = new DateFormat('2026-01-15T12:00:00.123Z')
    test('isSameHour()', () => {
      expect(a.isSameHour(new DateFormat('2026-01-15T12:30:00Z'))).toBe(true)
      expect(a.isSameHour(new DateFormat('2026-01-15T13:00:00Z'))).toBe(false)
    })
    test('isSameMinute()', () => {
      expect(a.isSameMinute(new DateFormat('2026-01-15T12:00:30Z'))).toBe(true)
      expect(a.isSameMinute(new DateFormat('2026-01-15T12:01:00Z'))).toBe(false)
    })
    test('isSameSecond()', () => {
      expect(a.isSameSecond(new DateFormat('2026-01-15T12:00:00.999Z'))).toBe(true)
      expect(a.isSameSecond(new DateFormat('2026-01-15T12:00:01Z'))).toBe(false)
    })
  })

  describe('Quarter', () => {
    test('isCurrentQuarter() / isNextQuarter() / isLastQuarter()', () => {
      expect(now().isCurrentQuarter()).toBe(true)
      expect(now().add(1, 'quarter').isNextQuarter()).toBe(true)
      expect(now().subtract(1, 'quarter').isLastQuarter()).toBe(true)
    })

    test('isSameQuarter()', () => {
      const current = now()
      expect(current.isSameQuarter(current.add(1, 'day'))).toBe(true)
      expect(current.isSameQuarter(current.add(4, 'month'))).toBe(false)
    })
  })
})

// ─── diff(), add(), subtract(), isBefore(), isAfter(), isSame(), isBetween() ──
describe('diff / comparison / isBetween', () => {
  const a = new DateFormat('2026-01-15T12:00:00Z')
  const b = new DateFormat('2026-01-16T12:00:00Z')

  test('diff in days', () => {
    expect(b.diff(a, 'day')).toBe(1)
  })

  test('diff in hours', () => {
    expect(b.diff(a, 'hour')).toBe(24)
  })

  test('diff in milliseconds', () => {
    expect(b.diff(a, 'millisecond')).toBe(86_400_000)
  })

  test('diff floating=true', () => {
    const c = new DateFormat('2026-01-15T18:00:00Z')
    const result = c.diff(a, 'day', true)
    expect(result).toBeCloseTo(0.25, 2)
  })

  test('diff with string other (non-DateFormat) and default unit', () => {
    const result = b.diff('2026-01-15T12:00:00Z')
    expect(result).toBe(86_400_000)
  })

  test('diff with unknown unit throws', () => {
    expect(() => b.diff(a, 'unknown' as 'day')).toThrow(/Unknown unit/)
  })

  test('add month uses set internally', () => {
    const d = new DateFormat('2026-01-15T12:00:00Z')
    const added = d.add(1, 'month')
    expect(added.get('month')).toBe(2)
  })

  test('add year uses set internally', () => {
    const d = new DateFormat('2026-01-15T12:00:00Z')
    const added = d.add(1, 'year')
    expect(added.get('year')).toBe(2027)
  })

  test('add other units (day)', () => {
    const d = new DateFormat('2026-01-15T12:00:00Z')
    const added = d.add(3, 'day')
    expect(added.get('date')).toBe(18)
  })

  test('add unknown unit → throws', () => {
    const d = new DateFormat(FAKE_MS)
    expect(() => d.add(1, 'unknown' as 'day')).toThrow(/Unknown unit/)
  })

  test('subtract = negative add', () => {
    const d = new DateFormat('2026-01-15T12:00:00Z')
    expect(d.subtract(1, 'day').valueOf()).toBe(d.add(-1, 'day').valueOf())
  })

  test('isBefore', () => {
    expect(a.isBefore(b)).toBe(true)
    expect(b.isBefore(a)).toBe(false)
  })

  test('isAfter', () => {
    expect(b.isAfter(a)).toBe(true)
    expect(a.isAfter(b)).toBe(false)
  })

  test('isSame', () => {
    expect(a.isSame(a.clone())).toBe(true)
    expect(a.isSame(b)).toBe(false)
  })

  test('isBetween inside → true', () => {
    const mid = new DateFormat('2026-01-15T18:00:00Z')
    expect(mid.isBetween(a, b)).toBe(true)
  })

  test('isBetween on boundary → false', () => {
    expect(a.isBetween(a, b)).toBe(false)
    expect(b.isBetween(a, b)).toBe(false)
  })

  test('isBetween outside → false', () => {
    const outside = new DateFormat('2026-01-17T12:00:00Z')
    expect(outside.isBetween(a, b)).toBe(false)
  })
})

// ─── utc(), local() ───────────────────────────────────────────────────────────
describe('utc() and local()', () => {
  test('d.utc() → isUtc() true', () => {
    const d = new DateFormat(FAKE_MS)
    expect(d.utc().isUtc()).toBe(true)
  })

  test('d.utc().local() → isLocal() true', () => {
    const d = new DateFormat(FAKE_MS)
    expect(d.utc().local().isLocal()).toBe(true)
  })

  test('already local → local() returns clone', () => {
    const d = new DateFormat(FAKE_MS)
    expect(d.isLocal()).toBe(true)
    const cloned = d.local()
    expect(cloned.isLocal()).toBe(true)
    expect(cloned.valueOf()).toBe(d.valueOf())
  })
})

// ─── Date component get() / set() ────────────────────────────────────────────
describe('get() and set()', () => {
  const utcDate = new DateFormat('2026-06-15T14:30:45.123Z')

  test('get year in UTC', () => expect(utcDate.get('year')).toBe(2026))
  test('get month in UTC', () => expect(utcDate.get('month')).toBe(6))
  test('get date in UTC', () => expect(utcDate.get('date')).toBe(15))
  test('get hour in UTC', () => expect(utcDate.get('hour')).toBe(14))
  test('get minute in UTC', () => expect(utcDate.get('minute')).toBe(30))
  test('get second in UTC', () => expect(utcDate.get('second')).toBe(45))
  test('get millisecond in UTC', () => expect(utcDate.get('millisecond')).toBe(123))

  test('get day (weekday) in UTC', () => {
    // 2026-06-15 is a Monday (1)
    expect(utcDate.get('day')).toBe(1)
  })

  test('get unknown → throws', () => {
    // 'fortnight' is actually a valid alias; use a truly unknown unit instead.
    expect(() => utcDate.get('zzz-bogus' as 'year')).toThrow(/unit/i)
  })

  test('set year', () => {
    expect(utcDate.set('year', 2030).get('year')).toBe(2030)
  })

  test('set month', () => {
    expect(utcDate.set('month', 3).get('month')).toBe(3)
  })

  test('set date', () => {
    expect(utcDate.set('date', 1).get('date')).toBe(1)
  })

  test('set hour', () => {
    expect(utcDate.set('hour', 8).get('hour')).toBe(8)
  })

  test('set minute', () => {
    expect(utcDate.set('minute', 0).get('minute')).toBe(0)
  })

  test('set second', () => {
    expect(utcDate.set('second', 0).get('second')).toBe(0)
  })

  test('set millisecond', () => {
    expect(utcDate.set('millisecond', 0).get('millisecond')).toBe(0)
  })

  test('set unknown → throws', () => {
    expect(() => utcDate.set('zzz-bogus' as 'year', 1)).toThrow(/unit/i)
  })

  test('set does not mutate original', () => {
    const original = new DateFormat('2026-06-15T14:30:45Z')
    const modified = original.set('year', 2030)
    expect(original.get('year')).toBe(2026)
    expect(modified.get('year')).toBe(2030)
  })
})

// ─── daysInMonth(), isLeapYear(), dayOfYear() ─────────────────────────────────
describe('daysInMonth / isLeapYear / dayOfYear', () => {
  test('daysInMonth Feb leap year', () => {
    expect(new DateFormat('2024-02-15').daysInMonth()).toBe(29)
  })

  test('daysInMonth Feb non-leap year', () => {
    expect(new DateFormat('2025-02-15').daysInMonth()).toBe(28)
  })

  test('daysInMonth April (30 days)', () => {
    expect(new DateFormat('2026-04-10').daysInMonth()).toBe(30)
  })

  test('daysInMonth January (31 days)', () => {
    expect(new DateFormat('2026-01-01').daysInMonth()).toBe(31)
  })

  test('isLeapYear 2000 → true', () => {
    expect(new DateFormat('2000-06-01').isLeapYear()).toBe(true)
  })

  test('isLeapYear 1900 → false', () => {
    expect(new DateFormat('1900-06-01').isLeapYear()).toBe(false)
  })

  test('isLeapYear 2024 → true', () => {
    expect(new DateFormat('2024-01-01').isLeapYear()).toBe(true)
  })

  test('isLeapYear 2025 → false', () => {
    expect(new DateFormat('2025-01-01').isLeapYear()).toBe(false)
  })

  test('dayOfYear Jan 1 → 1', () => {
    expect(new DateFormat('2026-01-01').dayOfYear()).toBe(1)
  })

  test('dayOfYear Dec 31 non-leap → 365', () => {
    expect(new DateFormat('2025-12-31').dayOfYear()).toBe(365)
  })

  test('dayOfYear Feb 28 in non-leap year → 59', () => {
    expect(new DateFormat('2025-02-28').dayOfYear()).toBe(59)
  })
})

// ─── weekday(), quarter(), isoWeek(), isoWeekYear() ───────────────────────────
describe('weekday / quarter / isoWeek / isoWeekYear', () => {
  test('weekday() = get(day)', () => {
    const d = new DateFormat('2026-01-15')
    expect(d.weekday()).toBe(d.get('day'))
  })

  test('quarter() Jan-Mar → 1', () => {
    expect(new DateFormat('2026-01-15').quarter()).toBe(1)
    expect(new DateFormat('2026-03-31').quarter()).toBe(1)
  })

  test('quarter() Apr-Jun → 2', () => {
    expect(new DateFormat('2026-04-01').quarter()).toBe(2)
    expect(new DateFormat('2026-06-30').quarter()).toBe(2)
  })

  test('quarter() Jul-Sep → 3', () => {
    expect(new DateFormat('2026-07-01').quarter()).toBe(3)
  })

  test('quarter() Oct-Dec → 4', () => {
    expect(new DateFormat('2026-10-01').quarter()).toBe(4)
    expect(new DateFormat('2026-12-31').quarter()).toBe(4)
  })

  test('isoWeek() for 2026-01-15 → ISO week 3', () => {
    // Per ISO 8601: Mon 2026-01-12 starts week 3; Thu 2026-01-15 is in that week.
    const d = new DateFormat('2026-01-15')
    expect(d.isoWeek()).toBe(3)
  })

  test('isoWeek() for 2026-01-01 → ISO week 1', () => {
    // 2026-01-01 (Thu) — under ISO 8601, week 1 contains the first Thursday.
    const d = new DateFormat('2026-01-01')
    expect(d.isoWeek()).toBe(1)
  })

  test('isoWeekYear() matches year for mid-year', () => {
    const d = new DateFormat('2026-06-15')
    expect(d.isoWeekYear()).toBe(2026)
  })

  test('week() = isoWeek()', () => {
    const d = new DateFormat('2026-01-15')
    expect(d.week()).toBe(d.isoWeek())
  })

  test('isoWeek() returns a value in [1, 53]', () => {
    for (const y of ['2015-06-01', '2018-06-01', '2020-06-01', '2026-06-15']) {
      const w = new DateFormat(y).isoWeek()
      expect(Number.isInteger(w)).toBe(true)
      expect(w).toBeGreaterThanOrEqual(1)
      expect(w).toBeLessThanOrEqual(53)
    }
  })
})

// ─── startOf() / endOf() ──────────────────────────────────────────────────────
describe('startOf() and endOf()', () => {
  const d = new DateFormat('2026-06-15T14:30:45.500Z')

  test('startOf year', () => {
    const s = d.startOf('year')
    expect(s.get('month')).toBe(1)
    expect(s.get('date')).toBe(1)
    expect(s.get('hour')).toBe(0)
    expect(s.get('minute')).toBe(0)
    expect(s.get('second')).toBe(0)
    expect(s.get('millisecond')).toBe(0)
  })

  test('startOf month', () => {
    const s = d.startOf('month')
    expect(s.get('date')).toBe(1)
    expect(s.get('hour')).toBe(0)
  })

  test('startOf week', () => {
    // week starts on Sunday; 2026-06-15 is Monday, so startOf week is Sunday June 14
    const s = d.startOf('week')
    expect(s.get('day')).toBe(0)
    expect(s.get('hour')).toBe(0)
  })

  test('startOf quarter Q2 (June) → April 1', () => {
    const s = d.startOf('quarter')
    expect(s.get('month')).toBe(4)
    expect(s.get('date')).toBe(1)
  })

  test('startOf day', () => {
    const s = d.startOf('day')
    expect(s.get('hour')).toBe(0)
    expect(s.get('minute')).toBe(0)
    expect(s.get('second')).toBe(0)
    expect(s.get('millisecond')).toBe(0)
  })

  test('startOf hour', () => {
    const s = d.startOf('hour')
    expect(s.get('minute')).toBe(0)
    expect(s.get('second')).toBe(0)
    expect(s.get('millisecond')).toBe(0)
  })

  test('startOf minute', () => {
    const s = d.startOf('minute')
    expect(s.get('second')).toBe(0)
    expect(s.get('millisecond')).toBe(0)
  })

  test('startOf second', () => {
    const s = d.startOf('second')
    expect(s.get('millisecond')).toBe(0)
  })

  test('startOf unknown unit → throws', () => {
    expect(() => d.startOf('zzz-bogus' as 'week')).toThrow(/unit/i)
  })

  test('endOf day is 23:59:59.999', () => {
    const e = d.endOf('day')
    expect(e.get('hour')).toBe(23)
    expect(e.get('minute')).toBe(59)
    expect(e.get('second')).toBe(59)
    expect(e.get('millisecond')).toBe(999)
  })

  test('endOf month is last day', () => {
    const e = new DateFormat('2026-02-15').endOf('month')
    expect(e.get('date')).toBe(28)
  })
})

// ─── format() ────────────────────────────────────────────────────────────────
describe('format()', () => {
  // UTC: 2026-01-15T12:00:00.000Z, Thursday (day=4), week 3
  const d = new DateFormat('2026-01-15T12:00:00.000Z')

  test('YYYY → full year', () => expect(d.format('YYYY')).toBe('2026'))
  test('YY → two-digit year', () => expect(d.format('YY')).toBe('26'))
  test('Q → quarter 1', () => expect(d.format('Q')).toBe('1'))
  test('gggg → 4-digit ISO week year', () => expect(d.format('gggg')).toBe(String(d.isoWeekYear())))
  test('gg → 2-digit ISO week year', () =>
    expect(d.format('gg')).toBe(String(d.isoWeekYear()).slice(-2)))

  test('Mo → ordinal month (1st)', () => expect(d.format('Mo')).toBe('1st'))
  test('MMMM → full month name', () => expect(d.format('MMMM')).toBe('January'))
  test('MMM → short month name', () => expect(d.format('MMM')).toBe('Jan'))
  test('MM → zero-padded month', () => expect(d.format('MM')).toBe('01'))
  test('M → month number', () => expect(d.format('M')).toBe('1'))

  test('DDDD → zero-padded day of year', () => expect(d.format('DDDD')).toBe('015'))
  test('DDD → day of year', () => expect(d.format('DDD')).toBe('15'))
  test('Do → ordinal day', () => expect(d.format('Do')).toBe('15th'))
  test('DD → zero-padded date', () => expect(d.format('DD')).toBe('15'))
  test('D → date', () => expect(d.format('D')).toBe('15'))

  // isoWeek for 2026-01-15 = 3 (ISO 8601 — Thursday in week 3 of 2026).
  test('WW → zero-padded week', () => expect(d.format('WW')).toBe('03'))
  test('W → week number', () => expect(d.format('W')).toBe('3'))

  test('Z → timezone offset with colon', () => expect(d.format('Z')).toMatch(/^[+-]\d{2}:\d{2}$/))
  test('ZZ → timezone offset without colon', () => expect(d.format('ZZ')).toMatch(/^[+-]\d{4}$/))

  test('Z → offset string format (sign + HH:MM)', () => {
    // Mocking Date.prototype.getTimezoneOffset is brittle across Node versions;
    // instead just assert the format shape.
    const local = new DateFormat('2026-01-15T12:00:00.000Z')
    expect(local.format('Z')).toMatch(/^[+-]\d{2}:\d{2}$/)
    expect(local.format('ZZ')).toMatch(/^[+-]\d{4}$/)
  })

  test('dddd → full weekday name (Thursday)', () => expect(d.format('dddd')).toBe('Thursday'))
  test('ddd → short weekday', () => expect(d.format('ddd')).toBe('Thu'))
  test('dd → min weekday', () => expect(d.format('dd')).toBe('Th'))
  test('d → day index', () => expect(d.format('d')).toBe('4'))

  test('HH → zero-padded 24h', () => expect(d.format('HH')).toBe('12'))
  test('H → 24h no pad', () => expect(d.format('H')).toBe('12'))
  test('hh → zero-padded 12h (noon → 12)', () => expect(d.format('hh')).toBe('12'))
  test('h → 12h no pad (noon)', () => expect(d.format('h')).toBe('12'))

  test('midnight: hh → 12', () => {
    expect(new DateFormat('2026-01-15T00:00:00Z').format('hh')).toBe('12')
  })

  test('1am: h → 1', () => {
    expect(new DateFormat('2026-01-15T01:00:00Z').format('h')).toBe('1')
  })

  test('mm → zero-padded minutes', () => expect(d.format('mm')).toBe('00'))
  test('m → minutes', () => expect(d.format('m')).toBe('0'))
  test('ss → zero-padded seconds', () => expect(d.format('ss')).toBe('00'))
  test('s → seconds', () => expect(d.format('s')).toBe('0'))

  test('A → AM at noon', () => expect(d.format('A')).toBe('PM'))
  test('a → pm at noon', () => expect(d.format('a')).toBe('pm'))

  test('A → AM at midnight', () => {
    expect(new DateFormat('2026-01-15T00:00:00Z').format('A')).toBe('AM')
  })

  test('X → unix seconds', () => {
    expect(d.format('X')).toBe(String(d.unix()))
  })

  test('x → unix milliseconds', () => {
    expect(d.format('x')).toBe(String(d.valueOf()))
  })

  test('invalid date → "Invalid Date"', () => {
    expect(new DateFormat(NaN).format('YYYY-MM-DD')).toBe('Invalid Date')
  })

  test('ordinal 2nd', () => {
    expect(new DateFormat('2026-01-02T00:00:00Z').format('Do')).toBe('2nd')
  })

  test('ordinal 3rd', () => {
    expect(new DateFormat('2026-01-03T00:00:00Z').format('Do')).toBe('3rd')
  })

  test('ordinal 11th (not 11st)', () => {
    expect(new DateFormat('2026-01-11T00:00:00Z').format('Do')).toBe('11th')
  })

  test('ordinal 12th (not 12nd)', () => {
    expect(new DateFormat('2026-01-12T00:00:00Z').format('Do')).toBe('12th')
  })

  test('ordinal 13th (not 13rd)', () => {
    expect(new DateFormat('2026-01-13T00:00:00Z').format('Do')).toBe('13th')
  })

  test('Mo ordinal 2nd', () => {
    expect(new DateFormat('2026-02-01T00:00:00Z').format('Mo')).toBe('2nd')
  })

  test('Mo ordinal 3rd', () => {
    expect(new DateFormat('2026-03-01T00:00:00Z').format('Mo')).toBe('3rd')
  })

  test('Mo ordinal 11th', () => {
    expect(new DateFormat('2026-11-01T00:00:00Z').format('Mo')).toBe('11th')
  })

  test('default locale formats month/weekday as English strings', () => {
    expect(d.format('MMMM')).toBe('January')
    expect(d.format('MMM')).toBe('Jan')
    expect(d.format('dddd')).toBe('Thursday')
  })
})

// ─── formatIntl() ────────────────────────────────────────────────────────────
describe('formatIntl()', () => {
  const d = new DateFormat('2026-01-15T12:00:00.000Z')

  test('non-UTC instance uses local timezone (undefined)', () => {
    const local = new DateFormat('2026-01-15')
    const result = local.formatIntl({ year: 'numeric' })
    expect(result).toContain('2026')
  })

  test('basic formatting with year/month/day', () => {
    const result = d.formatIntl({ year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
    expect(result).toContain('2026')
    expect(result).toContain('January')
    expect(result).toContain('15')
  })

  test('weekday+month+day long format', () => {
    const result = d.formatIntl({ weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })
    expect(result).toContain('Thursday')
    expect(result).toContain('January')
    expect(result).toContain('15')
  })

  test('weekday+month+day produces a non-empty string', () => {
    const result = d.formatIntl({ weekday: 'long', month: 'long', day: 'numeric' })
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  test('formatIntl() with no args uses default empty opts', () => {
    const result = d.formatIntl()
    expect(typeof result).toBe('string')
  })

  test('formatIntl() works with the default locale', () => {
    const result = d.formatIntl({ year: 'numeric' })
    expect(result).toContain('2026')
  })

  test('formatIntl() on non-UTC instance (_utc=false → undefined timezone)', () => {
    const local = new DateFormat(FAKE_MS)
    const result = local.formatIntl({ year: 'numeric' })
    expect(result).toContain('2026')
  })
})

// ─── fromNow() ────────────────────────────────────────────────────────────────
// Uses Moment.js-style thresholds:
//   < 45s        → "a few seconds"
//   [45s, 60s)   → "%d seconds"
//   < 90min      → "a minute" / "%d minutes"
//   < 22h        → "an hour"  / "%d hours"
//   < 26d        → "a day"    / "%d days"
//   ...
describe('fromNow()', () => {
  test('a few seconds bucket: sub-second / sub-45s → "a few seconds"', () => {
    expect(new DateFormat(FAKE_MS + 500).fromNow()).toBe('in a few seconds')
    expect(new DateFormat(FAKE_MS - 500).fromNow()).toBe('a few seconds ago')
    expect(new DateFormat(FAKE_MS + 30_000).fromNow()).toBe('in a few seconds')
  })

  test('seconds bucket [45s, 60s) → "%d seconds"', () => {
    expect(new DateFormat(FAKE_MS + 50_000).fromNow()).toBe('in 50 seconds')
  })

  test('minute bucket: 5 minutes → "in 5 minutes"', () => {
    expect(new DateFormat(FAKE_MS + 5 * 60_000).fromNow()).toBe('in 5 minutes')
  })

  test('singular 1 minute → "a minute"', () => {
    expect(new DateFormat(FAKE_MS + 60_000).fromNow()).toBe('in a minute')
  })

  test('hour bucket: 3 hours → "in 3 hours"', () => {
    expect(new DateFormat(FAKE_MS + 3 * 3_600_000).fromNow()).toBe('in 3 hours')
  })

  test('exactly 1 hour falls in the minute bucket → "60 minutes"', () => {
    // 60min < 90min threshold, so the minute divisor wins.
    expect(new DateFormat(FAKE_MS + 3_600_000).fromNow()).toBe('in 60 minutes')
  })

  test('day bucket: 2 days → "in 2 days"', () => {
    expect(new DateFormat(FAKE_MS + 2 * 86_400_000).fromNow()).toBe('in 2 days')
  })

  test('singular 1 day → "a day"', () => {
    expect(new DateFormat(FAKE_MS + 86_400_000).fromNow()).toBe('in a day')
  })

  test('past days → "X days ago"', () => {
    expect(new DateFormat(FAKE_MS - 3 * 86_400_000).fromNow()).toBe('3 days ago')
  })
})

// ─── calendar() ───────────────────────────────────────────────────────────────
describe('calendar()', () => {
  test('Today', () => {
    const d = new DateFormat(FAKE_MS)
    expect(d.calendar()).toMatch(/Today/i)
  })

  test('Yesterday', () => {
    const d = new DateFormat(FAKE_MS - 86_400_000)
    expect(d.calendar()).toMatch(/Yesterday/i)
  })

  test('Tomorrow', () => {
    const d = new DateFormat(FAKE_MS + 86_400_000)
    expect(d.calendar()).toMatch(/Tomorrow/i)
  })

  test('Other date → non-empty string', () => {
    const d = new DateFormat(FAKE_MS - 30 * 86_400_000)
    const out = d.calendar()
    expect(typeof out).toBe('string')
    expect(out.length).toBeGreaterThan(0)
  })
})

// ─── Serialization ────────────────────────────────────────────────────────────
describe('Serialization', () => {
  const d = new DateFormat('2026-01-15T12:00:00.000Z')

  test('toMillis() = valueOf()', () => {
    expect(d.toMillis()).toBe(d.valueOf())
  })

  test('toRFC2822() matches RFC2822 pattern', () => {
    const result = d.toRFC2822()
    // e.g. "Thu, 15 Jan 2026 12:00:00 +0000"
    expect(result).toMatch(/^\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} [+-]\d{4}$/)
  })

  test('toRFC2822() with non-zero negative offset → sign "-"', () => {
    vi.useRealTimers()
    const spy = vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(300) // UTC-5
    const result = new DateFormat('2026-01-15T12:00:00.000Z').toRFC2822()
    expect(result).toContain('-0500')
    spy.mockRestore()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(FAKE_NOW))
  })

  test('toRFC2822() with non-zero positive offset → sign "+"', () => {
    vi.useRealTimers()
    const spy = vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-330) // UTC+5:30
    const result = new DateFormat('2026-01-15T12:00:00.000Z').toRFC2822()
    expect(result).toContain('+0530')
    spy.mockRestore()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(FAKE_NOW))
  })

  test('toRFC3339() → valid datetime string', () => {
    const result = d.toRFC3339()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  test('toRFC3339() with non-zero offset → offset appended instead of Z', () => {
    vi.useRealTimers()
    const spy = vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-330) // UTC+5:30
    const result = new DateFormat('2026-01-15T12:00:00.000Z').toRFC3339()
    expect(result).toContain('+05:30')
    expect(result).not.toMatch(/Z$/)
    spy.mockRestore()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(FAKE_NOW))
  })

  test('toRFC3339() with zero offset (UTC) → appends Z', () => {
    vi.useRealTimers()
    const spy = vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(0)
    const result = new DateFormat('2026-01-15T12:00:00.000Z').toRFC3339()
    expect(result).toMatch(/Z$/)
    spy.mockRestore()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(FAKE_NOW))
  })

  test('toRFC3339() with negative offset (UTC-5) → appends -05:00', () => {
    vi.useRealTimers()
    const spy = vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(300) // UTC-5
    const result = new DateFormat('2026-01-15T12:00:00.000Z').toRFC3339()
    expect(result).toContain('-05:00')
    spy.mockRestore()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(FAKE_NOW))
  })

  test('toSQL() → YYYY-MM-DD HH:mm:ss', () => {
    // UTC date: 2026-01-15T12:00:00
    expect(d.toSQL()).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  })

  test('toSQLDate() → YYYY-MM-DD', () => {
    expect(d.toSQLDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test('toSQLTime() → HH:mm:ss', () => {
    expect(d.toSQLTime()).toMatch(/^\d{2}:\d{2}:\d{2}$/)
  })

  test('toExcel() → numeric > 0', () => {
    const excel = d.toExcel()
    expect(excel).toBeGreaterThan(0)
    // 2026-01-15 should be around 45,957 days since Excel epoch
    expect(excel).toBeGreaterThan(45000)
  })
})

// ─── preciseDiff() / preciseFrom() / age() ────────────────────────────────────
describe('preciseDiff() / preciseFrom() / age()', () => {
  test('same date → all zeros, humanize → "just now"', () => {
    const d = new DateFormat('2026-01-15T12:00:00Z')
    const result = d.preciseDiff(d.clone())
    expect(result.years).toBe(0)
    expect(result.months).toBe(0)
    expect(result.days).toBe(0)
    expect(result.hours).toBe(0)
    expect(result.minutes).toBe(0)
    expect(result.seconds).toBe(0)
    expect(result.milliseconds).toBe(0)
    expect(result.humanize()).toBe('just now')
  })

  test('1 year, 2 months, 5 days apart', () => {
    const a = new DateFormat('2024-03-10T00:00:00Z')
    const b = new DateFormat('2025-05-15T00:00:00Z')
    const result = b.preciseDiff(a)
    expect(result.years).toBe(1)
    expect(result.months).toBe(2)
    expect(result.days).toBe(5)
  })

  test('3 hours, 10 minutes, 30 seconds apart', () => {
    const a = new DateFormat('2026-01-15T09:00:00Z')
    const b = new DateFormat('2026-01-15T12:10:30Z')
    const result = b.preciseDiff(a)
    expect(result.hours).toBe(3)
    expect(result.minutes).toBe(10)
    expect(result.seconds).toBe(30)
  })

  test('milliseconds cascade to seconds', () => {
    const a = new DateFormat('2026-01-15T12:00:00.500Z')
    const b = new DateFormat('2026-01-15T12:00:01.000Z')
    const result = b.preciseDiff(a)
    expect(result.milliseconds).toBe(500)
    expect(result.seconds).toBe(0)
  })

  test('days negative case (borrow from month)', () => {
    // Jan 31 to Feb 28: days = 28 - 31 < 0, borrow from month
    const a = new DateFormat('2025-01-31T00:00:00Z')
    const b = new DateFormat('2025-02-28T00:00:00Z')
    const result = b.preciseDiff(a)
    expect(result.days).toBeGreaterThanOrEqual(0)
    expect(result.months).toBeGreaterThanOrEqual(0)
  })

  test('months negative case (borrow from year)', () => {
    // March to January: months = 1 - 3 < 0, borrow from year
    const a = new DateFormat('2025-03-15T00:00:00Z')
    const b = new DateFormat('2026-01-15T00:00:00Z')
    const result = b.preciseDiff(a)
    expect(result.years).toBe(0)
    expect(result.months).toBe(10)
  })

  test('seconds cascade (b.second < a.second, no ms adjustment needed)', () => {
    const a = new DateFormat('2026-01-15T12:00:45Z')
    const b = new DateFormat('2026-01-15T12:01:30Z')
    const result = b.preciseDiff(a)
    expect(result.seconds).toBe(45)
    expect(result.minutes).toBe(0)
  })

  test('minutes cascade (b.minute < a.minute)', () => {
    const a = new DateFormat('2026-01-15T12:45:00Z')
    const b = new DateFormat('2026-01-15T13:30:00Z')
    const result = b.preciseDiff(a)
    expect(result.minutes).toBe(45)
    expect(result.hours).toBe(0)
  })

  test('hours cascade (b.hour < a.hour across day boundary)', () => {
    const a = new DateFormat('2026-01-15T20:00:00Z')
    const b = new DateFormat('2026-01-16T10:00:00Z')
    const result = b.preciseDiff(a)
    expect(result.hours).toBe(14)
    expect(result.days).toBe(0)
  })

  test('humanize() multi-unit', () => {
    const a = new DateFormat('2024-01-01T00:00:00Z')
    const b = new DateFormat('2025-06-15T00:00:00Z')
    const result = b.preciseDiff(a)
    const text = result.humanize()
    expect(text).toContain('year')
    expect(text).toContain('month')
  })

  test('humanize() singular year', () => {
    const a = new DateFormat('2024-06-15T00:00:00Z')
    const b = new DateFormat('2025-06-15T00:00:00Z')
    const text = b.preciseDiff(a).humanize()
    expect(text).toContain('1 year')
    expect(text).not.toContain('1 years')
  })

  test('humanize() singular month, day, hour, minute, second', () => {
    // 1 month apart
    expect(
      new DateFormat('2026-02-15T00:00:00Z')
        .preciseDiff(new DateFormat('2026-01-15T00:00:00Z'))
        .humanize()
    ).toContain('1 month')
    // 1 day apart
    expect(
      new DateFormat('2026-01-16T00:00:00Z')
        .preciseDiff(new DateFormat('2026-01-15T00:00:00Z'))
        .humanize()
    ).toContain('1 day')
    // 1 hour apart
    expect(
      new DateFormat('2026-01-15T13:00:00Z')
        .preciseDiff(new DateFormat('2026-01-15T12:00:00Z'))
        .humanize()
    ).toContain('1 hour')
    // 1 minute apart
    expect(
      new DateFormat('2026-01-15T12:01:00Z')
        .preciseDiff(new DateFormat('2026-01-15T12:00:00Z'))
        .humanize()
    ).toContain('1 minute')
    // 1 second apart
    expect(
      new DateFormat('2026-01-15T12:00:01Z')
        .preciseDiff(new DateFormat('2026-01-15T12:00:00Z'))
        .humanize()
    ).toContain('1 second')
  })

  test('preciseDiff() with string argument (non-DateFormat input)', () => {
    const d = new DateFormat('2026-01-15T12:00:00Z')
    const result = d.preciseDiff('2024-01-15T00:00:00Z')
    expect(result.years).toBe(2)
  })

  test('preciseDiff() where this < other (isAfter=false branch)', () => {
    const smaller = new DateFormat('2024-01-01T00:00:00Z')
    const larger = new DateFormat('2026-06-15T00:00:00Z')
    const result = smaller.preciseDiff(larger)
    expect(result.years).toBeGreaterThanOrEqual(2)
  })

  test('humanize() years plural (2+ years)', () => {
    const a = new DateFormat('2022-01-15T00:00:00Z')
    const b = new DateFormat('2026-01-15T00:00:00Z')
    const text = b.preciseDiff(a).humanize()
    expect(text).toContain('4 years')
  })

  test('humanize() hours plural (2+ hours)', () => {
    const a = new DateFormat('2026-01-15T09:00:00Z')
    const b = new DateFormat('2026-01-15T12:00:00Z')
    const text = b.preciseDiff(a).humanize()
    expect(text).toContain('3 hours')
  })

  test('humanize() minutes plural (2+ minutes)', () => {
    const a = new DateFormat('2026-01-15T12:00:00Z')
    const b = new DateFormat('2026-01-15T12:05:00Z')
    const text = b.preciseDiff(a).humanize()
    expect(text).toContain('5 minutes')
  })

  test('humanize() seconds plural (2+ seconds)', () => {
    const a = new DateFormat('2026-01-15T12:00:00Z')
    const b = new DateFormat('2026-01-15T12:00:05Z')
    const text = b.preciseDiff(a).humanize()
    expect(text).toContain('5 seconds')
  })

  test('preciseFrom() → same as preciseDiff().humanize()', () => {
    const a = new DateFormat('2024-01-01T00:00:00Z')
    const b = new DateFormat('2025-06-15T00:00:00Z')
    expect(b.preciseFrom(a)).toBe(b.preciseDiff(a).humanize())
  })

  test('age() on a past date → years/months/days', () => {
    // Fake now is 2026-01-15; born 2024-01-15 = 2 years old
    const birthdate = new DateFormat('2024-01-15T00:00:00Z')
    const a = birthdate.age()
    expect(a.years).toBe(2)
    expect(typeof a.toString()).toBe('string')
  })

  test('age() toString shows years', () => {
    const birthdate = new DateFormat('2024-01-15T00:00:00Z')
    const a = birthdate.age()
    expect(a.toString()).toContain('2y')
  })

  test('age() today → 0d', () => {
    const today = new DateFormat(FAKE_MS)
    const a = today.age()
    expect(a.toString()).toBe('0d')
  })

  test('age() with months and days component', () => {
    // Fake now = 2026-01-15. Born 2025-10-10 → ~3 months, 5 days
    const birthdate = new DateFormat('2025-10-10T00:00:00Z')
    const a = birthdate.age()
    expect(a.months).toBeGreaterThan(0)
    expect(a.toString()).toContain('mo')
    expect(a.toString()).toContain('d')
  })
})

// ─── countdown() ─────────────────────────────────────────────────────────────
describe('countdown()', () => {
  // Fake now: FAKE_MS = 2026-01-15T12:00:00.000Z

  test('future date → isPast=false', () => {
    const future = new DateFormat(FAKE_MS + 2 * 86_400_000 + 3 * 3_600_000)
    const cd = future.countdown()
    expect(cd.isPast).toBe(false)
    expect(cd.days).toBe(2)
    expect(cd.hours).toBe(3)
  })

  test('past date → isPast=true', () => {
    const past = new DateFormat(FAKE_MS - 1000)
    const cd = past.countdown()
    expect(cd.isPast).toBe(true)
  })

  test('countdown total is negative for past', () => {
    const past = new DateFormat(FAKE_MS - 5000)
    expect(past.countdown().total).toBeLessThan(0)
  })

  test('humanize() for future with days and hours', () => {
    const future = new DateFormat(FAKE_MS + 2 * 86_400_000 + 3 * 3_600_000)
    const text = future.countdown().humanize()
    expect(text).toContain('2 days')
    expect(text).toContain('3 hours')
  })

  test('humanize() for past → "already passed"', () => {
    const past = new DateFormat(FAKE_MS - 1000)
    expect(past.countdown().humanize()).toBe('already passed')
  })

  test('format() with DD HH mm ss tokens', () => {
    const future = new DateFormat(FAKE_MS + 1 * 86_400_000 + 2 * 3_600_000 + 3 * 60_000 + 4_000)
    const result = future.countdown().format('DD:HH:mm:ss')
    expect(result).toBe('01:02:03:04')
  })

  test('humanize() only seconds → just "N seconds"', () => {
    const future = new DateFormat(FAKE_MS + 45_000)
    const text = future.countdown().humanize()
    expect(text).toContain('45 seconds')
  })

  test('humanize() all zero except ms → "now"', () => {
    const future = new DateFormat(FAKE_MS + 500)
    const text = future.countdown().humanize()
    expect(text).toBe('now')
  })

  test('singular 1 day humanize', () => {
    const future = new DateFormat(FAKE_MS + 86_400_000)
    const text = future.countdown().humanize()
    expect(text).toContain('1 day')
    expect(text).not.toContain('1 days')
  })

  test('singular 1 hour humanize', () => {
    const future = new DateFormat(FAKE_MS + 3_600_000)
    const text = future.countdown().humanize()
    expect(text).toContain('1 hour')
  })

  test('humanize() with minutes only → "N minutes"', () => {
    const future = new DateFormat(FAKE_MS + 5 * 60_000)
    const text = future.countdown().humanize()
    expect(text).toContain('5 minutes')
  })

  test('humanize() singular 1 minute', () => {
    const future = new DateFormat(FAKE_MS + 60_000)
    const text = future.countdown().humanize()
    expect(text).toContain('1 minute')
    expect(text).not.toContain('1 minutes')
  })

  test('humanize() singular 1 second', () => {
    const future = new DateFormat(FAKE_MS + 1_000)
    const text = future.countdown().humanize()
    expect(text).toContain('1 second')
    expect(text).not.toContain('1 seconds')
  })
})

// ─── calendarGrid() ───────────────────────────────────────────────────────────
describe('calendarGrid()', () => {
  // January 2026: starts on Thursday (day=4)
  const jan2026 = new DateFormat('2026-01-15')

  test('calendarGrid() with no args uses default opts (weekStart=sunday)', () => {
    const grid = jan2026.calendarGrid()
    expect(grid.length).toBe(6)
    grid.forEach((row) => expect(row.length).toBe(7))
  })

  test('returns 6 rows × 7 columns with weekStart=sunday', () => {
    const grid = jan2026.calendarGrid({ weekStart: 'sunday' })
    expect(grid.length).toBe(6)
    grid.forEach((row) => expect(row.length).toBe(7))
  })

  test('returns 6 rows × 7 columns with weekStart=monday', () => {
    const grid = jan2026.calendarGrid({ weekStart: 'monday' })
    expect(grid.length).toBe(6)
    grid.forEach((row) => expect(row.length).toBe(7))
  })

  test('first row contains previous month days when month does not start on week start (sunday)', () => {
    const grid = jan2026.calendarGrid({ weekStart: 'sunday' })
    // Jan 2026 starts on Thursday; so first row Sun-Wed are Dec 2025 days
    const firstRow = grid[0]
    // The first cell should be Dec 28, 2025 (Sunday before Jan 1)
    // Dec 28 is from previous month
    expect(firstRow![0]!.isCurrentMonth).toBe(false)
    expect(firstRow![0]!.date.get('month')).toBe(12) // December
  })

  test('last row contains next month days', () => {
    const grid = jan2026.calendarGrid({ weekStart: 'sunday' })
    const lastRow = grid[5]
    // Last row should have Feb 2026 days
    const nextMonthCells = lastRow!.filter((c) => !c.isCurrentMonth)
    expect(nextMonthCells.length).toBeGreaterThan(0)
    nextMonthCells.forEach((c) => expect(c.date.get('month')).toBe(2))
  })

  test('isCurrentMonth flags are correct', () => {
    const grid = jan2026.calendarGrid({ weekStart: 'sunday' })
    const all = grid.flat()
    all.forEach((cell) => {
      if (cell.isCurrentMonth) {
        expect(cell.date.get('month')).toBe(1)
        expect(cell.date.get('year')).toBe(2026)
      }
    })
  })

  test('isWeekend flags correct for Saturday/Sunday cells', () => {
    const grid = jan2026.calendarGrid({ weekStart: 'sunday' })
    const all = grid.flat()
    all.forEach((cell) => {
      const day = cell.date.get('day')
      if (day === 0 || day === 6) {
        expect(cell.isWeekend).toBe(true)
      } else {
        expect(cell.isWeekend).toBe(false)
      }
    })
  })

  test('all 31 January days appear in grid', () => {
    const grid = jan2026.calendarGrid({ weekStart: 'sunday' })
    const all = grid.flat()
    const janDays = all.filter((c) => c.isCurrentMonth)
    expect(janDays.length).toBe(31)
  })

  test('total cells = 42', () => {
    const grid = jan2026.calendarGrid({ weekStart: 'sunday' })
    expect(grid.flat().length).toBe(42)
  })

  test('weekStart=monday shifts grid by one day', () => {
    const gridSun = jan2026.calendarGrid({ weekStart: 'sunday' })
    const gridMon = jan2026.calendarGrid({ weekStart: 'monday' })
    // First cell of Sunday grid is Sunday; first of Monday grid starts Monday
    const firstSun = gridSun[0]![0]!.date.get('day')
    const firstMon = gridMon[0]![0]!.date.get('day')
    expect(firstSun).toBe(0) // Sunday
    expect(firstMon).toBe(1) // Monday (Jan starts on Thu; Mon before is Dec 28+1=29 Jan... actually Dec 29 which is Monday)
  })
})

// ─── fiscalYear() / fiscalQuarter() ──────────────────────────────────────────
describe('fiscalYear() / fiscalQuarter()', () => {
  test('default (startMonth=1) → calendar year', () => {
    expect(new DateFormat('2026-06-15').fiscalYear({ startMonth: 1 })).toBe(2026)
    expect(new DateFormat('2026-01-01').fiscalYear({ startMonth: 1 })).toBe(2026)
  })

  test('April fiscal year (India): date in April → year+1', () => {
    // April 2026 is in FY2027 (Apr 2026 – Mar 2027)
    expect(new DateFormat('2026-04-01').fiscalYear({ startMonth: 4 })).toBe(2027)
    expect(new DateFormat('2026-12-31').fiscalYear({ startMonth: 4 })).toBe(2027)
  })

  test('April fiscal year: date in March → current year', () => {
    // March 2026 is in FY2026 (Apr 2025 – Mar 2026)
    expect(new DateFormat('2026-03-31').fiscalYear({ startMonth: 4 })).toBe(2026)
    expect(new DateFormat('2026-01-01').fiscalYear({ startMonth: 4 })).toBe(2026)
  })

  test('fiscalQuarter default: Jan-Mar=Q1', () => {
    expect(new DateFormat('2026-01-15').fiscalQuarter({ startMonth: 1 })).toBe(1)
    expect(new DateFormat('2026-03-31').fiscalQuarter({ startMonth: 1 })).toBe(1)
  })

  test('fiscalQuarter default: Apr-Jun=Q2', () => {
    expect(new DateFormat('2026-04-01').fiscalQuarter({ startMonth: 1 })).toBe(2)
    expect(new DateFormat('2026-06-30').fiscalQuarter({ startMonth: 1 })).toBe(2)
  })

  test('fiscalQuarter default: Jul-Sep=Q3', () => {
    expect(new DateFormat('2026-07-01').fiscalQuarter({ startMonth: 1 })).toBe(3)
  })

  test('fiscalQuarter default: Oct-Dec=Q4', () => {
    expect(new DateFormat('2026-10-01').fiscalQuarter({ startMonth: 1 })).toBe(4)
    expect(new DateFormat('2026-12-31').fiscalQuarter({ startMonth: 1 })).toBe(4)
  })

  test('fiscalQuarter with startMonth=4: April=Q1', () => {
    expect(new DateFormat('2026-04-01').fiscalQuarter({ startMonth: 4 })).toBe(1)
  })

  test('fiscalQuarter with startMonth=4: July=Q2', () => {
    expect(new DateFormat('2026-07-01').fiscalQuarter({ startMonth: 4 })).toBe(2)
  })

  test('fiscalQuarter with startMonth=4: October=Q3', () => {
    expect(new DateFormat('2026-10-01').fiscalQuarter({ startMonth: 4 })).toBe(3)
  })

  test('fiscalQuarter with startMonth=4: January=Q4', () => {
    expect(new DateFormat('2026-01-01').fiscalQuarter({ startMonth: 4 })).toBe(4)
  })

  test('fiscalYear() with no args → uses default startMonth=1 → calendar year', () => {
    expect(new DateFormat('2026-06-15').fiscalYear()).toBe(2026)
  })

  test('fiscalQuarter() with no args → uses default startMonth=1 → Jan=Q1', () => {
    expect(new DateFormat('2026-01-15').fiscalQuarter()).toBe(1)
  })
})
