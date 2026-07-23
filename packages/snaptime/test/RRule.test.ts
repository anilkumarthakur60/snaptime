import { describe, expect, test } from 'vitest'
import { RRule, parseRRule, stringifyRRule } from '../src/rrule'

// All tests pin DTSTART explicitly so that nothing depends on Date.now().

describe('parseRRule()', () => {
  test('FREQ alone is enough', () => {
    const opts = parseRRule('FREQ=DAILY')
    expect(opts.freq).toBe('DAILY')
  })

  test('strips the leading "RRULE:" prefix', () => {
    const opts = parseRRule('RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR')
    expect(opts.freq).toBe('WEEKLY')
    expect(opts.byweekday).toEqual([{ day: 'MO' }, { day: 'WE' }, { day: 'FR' }])
  })

  test('parses INTERVAL, COUNT, BYMONTH, BYMONTHDAY', () => {
    const opts = parseRRule('FREQ=YEARLY;INTERVAL=2;COUNT=5;BYMONTH=6;BYMONTHDAY=15')
    expect(opts.interval).toBe(2)
    expect(opts.count).toBe(5)
    expect(opts.bymonth).toEqual([6])
    expect(opts.bymonthday).toEqual([15])
  })

  test('parses BYDAY with positive and negative N prefix', () => {
    const opts = parseRRule('FREQ=MONTHLY;BYDAY=2MO,-1FR')
    expect(opts.byweekday).toEqual([
      { day: 'MO', n: 2 },
      { day: 'FR', n: -1 }
    ])
  })

  test('parses UNTIL in compact iCal form (YYYYMMDDTHHMMSSZ)', () => {
    const opts = parseRRule('FREQ=DAILY;UNTIL=19971224T000000Z')
    expect(opts.until).toBeInstanceOf(Date)
    expect((opts.until as Date).toISOString()).toBe('1997-12-24T00:00:00.000Z')
  })

  test('parses UNTIL in compact date-only form (YYYYMMDD)', () => {
    const opts = parseRRule('FREQ=DAILY;UNTIL=19971224')
    expect(opts.until).toBeInstanceOf(Date)
  })

  test('parses BYSETPOS and WKST', () => {
    const opts = parseRRule('FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1;WKST=SU')
    expect(opts.bysetpos).toEqual([-1])
    expect(opts.wkst).toBe('SU')
  })

  test('throws on missing FREQ', () => {
    expect(() => parseRRule('INTERVAL=2')).toThrow(/missing FREQ/i)
  })

  test('throws on invalid FREQ', () => {
    expect(() => parseRRule('FREQ=BOGUS')).toThrow(/Invalid FREQ/i)
  })

  test('throws on malformed BYDAY token', () => {
    expect(() => parseRRule('FREQ=WEEKLY;BYDAY=ZZ')).toThrow(/Invalid BYDAY/i)
  })

  test('throws on segment with no equals sign', () => {
    expect(() => parseRRule('FREQ=DAILY;NOEQ')).toThrow(/Invalid RRULE segment/i)
  })

  test('silently ignores unknown extension keys', () => {
    expect(() => parseRRule('FREQ=DAILY;X-CUSTOM=foo')).not.toThrow()
  })
})

describe('stringifyRRule()', () => {
  test('round-trips through parse', () => {
    const input = 'FREQ=WEEKLY;INTERVAL=2;COUNT=10;BYDAY=MO,WE,FR'
    const opts = parseRRule(input)
    const out = stringifyRRule(opts)
    expect(parseRRule(out)).toEqual(opts)
  })

  test('omits INTERVAL when it equals 1', () => {
    expect(stringifyRRule({ freq: 'DAILY', interval: 1 })).toBe('FREQ=DAILY')
  })

  test('formats UNTIL in compact UTC form', () => {
    const out = stringifyRRule({
      freq: 'DAILY',
      until: new Date(Date.UTC(2026, 0, 15, 12, 0, 0))
    })
    expect(out).toContain('UNTIL=20260115T120000Z')
  })

  test('formats BYDAY with N prefix', () => {
    const out = stringifyRRule({
      freq: 'MONTHLY',
      byweekday: [{ day: 'MO', n: 2 }, { day: 'FR' }]
    })
    expect(out).toContain('BYDAY=2MO,FR')
  })
})

describe('RRule constructor', () => {
  test('rejects COUNT and UNTIL together', () => {
    expect(
      () =>
        new RRule({
          freq: 'DAILY',
          count: 5,
          until: new Date(Date.UTC(2026, 0, 15)),
          dtstart: new Date(Date.UTC(2026, 0, 1))
        })
    ).toThrow(/mutually exclusive/i)
  })

  test('defaults interval to 1 and wkst to MO', () => {
    const r = new RRule({ freq: 'DAILY', dtstart: new Date(Date.UTC(2026, 0, 1)) })
    expect(r.options.interval).toBe(1)
    expect(r.options.wkst).toBe('MO')
  })

  test('static parse() builds an RRule instance', () => {
    const r = RRule.parse('FREQ=DAILY;COUNT=3;DTSTART=20260101T000000Z')
    expect(r).toBeInstanceOf(RRule)
    expect(r.options.count).toBe(3)
  })

  test('toString() round-trips', () => {
    const r = RRule.parse('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE')
    expect(r.toString()).toContain('FREQ=WEEKLY')
    expect(r.toString()).toContain('BYDAY=MO,WE')
  })
})

describe('RRule iteration', () => {
  test('DAILY with COUNT yields N occurrences one day apart', () => {
    const r = new RRule({
      freq: 'DAILY',
      count: 5,
      dtstart: new Date(Date.UTC(2026, 0, 1, 9, 0, 0))
    })
    const dates = [...r].map((d) => d.toISOString())
    expect(dates).toHaveLength(5)
    // Each consecutive pair is exactly 24h apart.
    for (let i = 1; i < dates.length; i++) {
      const a = Date.parse(dates[i - 1]!)
      const b = Date.parse(dates[i]!)
      expect(b - a).toBe(86_400_000)
    }
  })

  test('WEEKLY with BYDAY=MO,WE,FR — first 6 occurrences', () => {
    // 2026-01-01 is a Thursday. The next MO is 2026-01-05.
    const r = new RRule({
      freq: 'WEEKLY',
      byweekday: ['MO', 'WE', 'FR'],
      count: 6,
      dtstart: new Date(Date.UTC(2026, 0, 1, 9, 0, 0))
    })
    const dows = r.take(6).map((d) => new Date(d.valueOf()).getUTCDay())
    // Each result is one of Mon(1) / Wed(3) / Fri(5)
    for (const dow of dows) {
      expect([1, 3, 5]).toContain(dow)
    }
    expect(dows).toHaveLength(6)
  })

  test('MONTHLY anchored to DTSTART day-of-month', () => {
    const r = new RRule({
      freq: 'MONTHLY',
      count: 3,
      dtstart: new Date(Date.UTC(2026, 0, 15, 9, 0, 0))
    })
    const days = r.take(3).map((d) => new Date(d.valueOf()).getUTCDate())
    expect(days).toEqual([15, 15, 15])
  })

  test('MONTHLY BYDAY=-1FR → last Friday of each month', () => {
    const r = new RRule({
      freq: 'MONTHLY',
      byweekday: [{ day: 'FR', n: -1 }],
      count: 3,
      dtstart: new Date(Date.UTC(2026, 0, 1, 9, 0, 0))
    })
    const out = r.take(3).map((d) => {
      const dt = new Date(d.valueOf())
      return { dow: dt.getUTCDay(), day: dt.getUTCDate(), month: dt.getUTCMonth() + 1 }
    })
    // Last Fridays of Jan/Feb/Mar 2026: Jan 30, Feb 27, Mar 27
    expect(out).toEqual([
      { dow: 5, day: 30, month: 1 },
      { dow: 5, day: 27, month: 2 },
      { dow: 5, day: 27, month: 3 }
    ])
  })

  test('YEARLY with BYMONTH=6;BYMONTHDAY=15', () => {
    const r = new RRule({
      freq: 'YEARLY',
      bymonth: [6],
      bymonthday: [15],
      count: 3,
      dtstart: new Date(Date.UTC(2026, 0, 1, 9, 0, 0))
    })
    const months = r.take(3).map((d) => new Date(d.valueOf()).getUTCMonth() + 1)
    const days = r.take(3).map((d) => new Date(d.valueOf()).getUTCDate())
    expect(months).toEqual([6, 6, 6])
    expect(days).toEqual([15, 15, 15])
  })

  test('INTERVAL=2 strides every other unit', () => {
    const r = new RRule({
      freq: 'DAILY',
      interval: 2,
      count: 4,
      dtstart: new Date(Date.UTC(2026, 0, 1))
    })
    const days = r.take(4).map((d) => new Date(d.valueOf()).getUTCDate())
    expect(days).toEqual([1, 3, 5, 7])
  })

  test('UNTIL stops the iterator', () => {
    const r = new RRule({
      freq: 'DAILY',
      dtstart: new Date(Date.UTC(2026, 0, 1)),
      until: new Date(Date.UTC(2026, 0, 5))
    })
    const all = [...r]
    expect(all).toHaveLength(5)
  })

  test('BYSETPOS=-1 picks the last item in each window', () => {
    // First MO in 2026 = Jan 5; weekly with BYDAY=MO,TU,WE,TH,FR & BYSETPOS=-1 → Friday each week.
    const r = new RRule({
      freq: 'WEEKLY',
      byweekday: ['MO', 'TU', 'WE', 'TH', 'FR'],
      bysetpos: [-1],
      count: 3,
      dtstart: new Date(Date.UTC(2026, 0, 5)) // Mon
    })
    const dows = r.take(3).map((d) => new Date(d.valueOf()).getUTCDay())
    expect(dows).toEqual([5, 5, 5])
  })
})

describe('RRule query helpers', () => {
  const r = new RRule({
    freq: 'DAILY',
    dtstart: new Date(Date.UTC(2026, 0, 1)),
    count: 30
  })

  test('between(start, end)', () => {
    const out = r.between(new Date(Date.UTC(2026, 0, 5)), new Date(Date.UTC(2026, 0, 9)))
    expect(out).toHaveLength(5)
  })

  test('between() honors limit', () => {
    const out = r.between(new Date(Date.UTC(2026, 0, 5)), new Date(Date.UTC(2026, 0, 20)), 3)
    expect(out).toHaveLength(3)
  })

  test('next(from) returns first occurrence ≥ from', () => {
    const n = r.next(new Date(Date.UTC(2026, 0, 10, 6, 0, 0)))
    expect(n).not.toBeNull()
    // The DTSTART has no time component so time is 00:00; "≥ Jan 10 06:00" → Jan 11.
    expect(new Date(n!.valueOf()).getUTCDate()).toBe(11)
  })

  test('matches() — true for an occurrence, false otherwise', () => {
    expect(r.matches(new Date(Date.UTC(2026, 0, 5)))).toBe(true)
    expect(r.matches(new Date(Date.UTC(2026, 0, 5, 12, 0, 0)))).toBe(false)
  })

  test('take(n) — first N occurrences', () => {
    const out = r.take(7)
    expect(out).toHaveLength(7)
  })
})
