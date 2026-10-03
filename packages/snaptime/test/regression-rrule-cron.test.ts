import { describe, expect, test } from 'vitest'
import { RRule } from '../src/rrule'
import Cron from '../src/ecosystem/Cron'
import DateTime from '../src/core/DateTime'

// ---------------------------------------------------------------------------
// Regression tests for audited RRULE + Cron defects. Every DTSTART is pinned
// explicitly. The RRULE engine operates on local wall-clock time, so dates
// are built with the local Date constructor and asserted through local
// components  the expectations hold in any IANA zone.
// ---------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, '0')

const fmt = (d: { valueOf(): number }) => {
  const x = new Date(d.valueOf())
  return (
    `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())} ` +
    `${pad(x.getHours())}:${pad(x.getMinutes())}:${pad(x.getSeconds())}`
  )
}

const local = (year: number, month: number, day: number, hour = 0, min = 0) =>
  new DateTime(new Date(year, month - 1, day, hour, min, 0, 0))

// ---------------------------------------------------------------------------
// B3  BYDAY / BYMONTHDAY must LIMIT DAILY (and sub-daily) frequencies
// (RFC 5545 §3.3.10 limit-vs-expand table; matches rrule.js / dateutil).
// ---------------------------------------------------------------------------
describe('B3: BYDAY/BYMONTHDAY limit DAILY frequencies', () => {
  test('FREQ=DAILY;BYDAY=MO,WE,FR from Mon 2025-06-02 yields Mon, Wed, Fri only', () => {
    const r = new RRule({
      freq: 'DAILY',
      byweekday: ['MO', 'WE', 'FR'],
      count: 7,
      dtstart: new Date(2025, 5, 2, 9, 0, 0) // Monday
    })
    expect([...r].map(fmt)).toEqual([
      '2025-06-02 09:00:00', // Mon
      '2025-06-04 09:00:00', // Wed
      '2025-06-06 09:00:00', // Fri
      '2025-06-09 09:00:00', // Mon
      '2025-06-11 09:00:00', // Wed
      '2025-06-13 09:00:00', // Fri
      '2025-06-16 09:00:00' // Mon
    ])
  })

  test('FREQ=DAILY;BYMONTHDAY=13 yields only the 13th of each month', () => {
    const r = new RRule({
      freq: 'DAILY',
      bymonthday: [13],
      count: 3,
      dtstart: new Date(2025, 5, 1, 9, 0, 0)
    })
    expect([...r].map(fmt)).toEqual([
      '2025-06-13 09:00:00',
      '2025-07-13 09:00:00',
      '2025-08-13 09:00:00'
    ])
  })

  test('FREQ=HOURLY;BYDAY limits sub-daily frequencies too', () => {
    // Sun 2025-06-01 22:00 start; only Monday hours pass the BYDAY filter.
    const r = new RRule({
      freq: 'HOURLY',
      byweekday: ['MO'],
      count: 3,
      dtstart: new Date(2025, 5, 1, 22, 0, 0)
    })
    expect([...r].map(fmt)).toEqual([
      '2025-06-02 00:00:00',
      '2025-06-02 01:00:00',
      '2025-06-02 02:00:00'
    ])
  })
})

// ---------------------------------------------------------------------------
// B4  BYHOUR/BYMINUTE/BYSECOND LIMIT frequencies at or above their own
// precision (they only expand for DAILY and coarser)  RFC 5545 §3.3.10.
// The old code remapped every hourly window onto the same instant, emitting
// endless duplicates.
// ---------------------------------------------------------------------------
describe('B4: BYHOUR limits HOURLY (no duplicate occurrences)', () => {
  test('FREQ=HOURLY;BYHOUR=9 yields 09:00 exactly once per day', () => {
    const r = new RRule({
      freq: 'HOURLY',
      byhour: [9],
      count: 3,
      dtstart: new Date(2025, 5, 1, 0, 0, 0)
    })
    expect([...r].map(fmt)).toEqual([
      '2025-06-01 09:00:00',
      '2025-06-02 09:00:00',
      '2025-06-03 09:00:00'
    ])
  })

  test('FREQ=HOURLY;BYHOUR=9;BYMINUTE=15,45  BYHOUR limits, BYMINUTE expands', () => {
    const r = new RRule({
      freq: 'HOURLY',
      byhour: [9],
      byminute: [15, 45],
      count: 4,
      dtstart: new Date(2025, 5, 1, 0, 0, 0)
    })
    expect([...r].map(fmt)).toEqual([
      '2025-06-01 09:15:00',
      '2025-06-01 09:45:00',
      '2025-06-02 09:15:00',
      '2025-06-02 09:45:00'
    ])
  })

  test('FREQ=MINUTELY;BYMINUTE=30  BYMINUTE limits MINUTELY', () => {
    const r = new RRule({
      freq: 'MINUTELY',
      byminute: [30],
      count: 2,
      dtstart: new Date(2025, 5, 1, 9, 0, 0)
    })
    expect([...r].map(fmt)).toEqual(['2025-06-01 09:30:00', '2025-06-01 10:30:00'])
  })
})

// ---------------------------------------------------------------------------
// B8  MONTHLY from a day-29/30/31 DTSTART: months lacking that day are
// SKIPPED, never clamped, and the window arithmetic must not drift past
// short months (RFC 5545: "Recurrence instances falling on invalid dates
// … are ignored"; matches rrule.js / dateutil).
// ---------------------------------------------------------------------------
describe('B8: MONTHLY day-31/30 anchors skip short months (no clamp, no drift)', () => {
  test('FREQ=MONTHLY from 2025-01-31 yields only 31-day months', () => {
    const r = new RRule({
      freq: 'MONTHLY',
      count: 5,
      dtstart: new Date(2025, 0, 31, 9, 0, 0)
    })
    expect([...r].map(fmt)).toEqual([
      '2025-01-31 09:00:00',
      '2025-03-31 09:00:00', // February skipped, not drifted into
      '2025-05-31 09:00:00', // April skipped
      '2025-07-31 09:00:00', // June skipped
      '2025-08-31 09:00:00'
    ])
  })

  test('FREQ=MONTHLY from 2025-01-30 skips February only', () => {
    const r = new RRule({
      freq: 'MONTHLY',
      count: 4,
      dtstart: new Date(2025, 0, 30, 9, 0, 0)
    })
    expect([...r].map(fmt)).toEqual([
      '2025-01-30 09:00:00',
      '2025-03-30 09:00:00',
      '2025-04-30 09:00:00',
      '2025-05-30 09:00:00'
    ])
  })

  test('FREQ=YEARLY from 2024-02-29 yields leap years only', () => {
    const r = new RRule({
      freq: 'YEARLY',
      count: 2,
      dtstart: new Date(2024, 1, 29, 9, 0, 0)
    })
    expect([...r].map(fmt)).toEqual(['2024-02-29 09:00:00', '2028-02-29 09:00:00'])
  })
})

// ---------------------------------------------------------------------------
// B9  YEARLY with BYYEARDAY/BYWEEKNO, or BYDAY without BYMONTH, must expand
// over the whole year (previously only DTSTART's month was expanded → zero
// occurrences).
// ---------------------------------------------------------------------------
describe('B9: YEARLY whole-year expansion', () => {
  test('FREQ=YEARLY;BYYEARDAY=100 → Apr 10 (Apr 9 in leap years)', () => {
    const r = new RRule({
      freq: 'YEARLY',
      byyearday: [100],
      count: 4,
      dtstart: new Date(2025, 0, 1, 9, 0, 0)
    })
    expect([...r].map(fmt)).toEqual([
      '2025-04-10 09:00:00',
      '2026-04-10 09:00:00',
      '2027-04-10 09:00:00',
      '2028-04-09 09:00:00' // leap year: day 100 = Apr 9
    ])
  })

  test('FREQ=YEARLY;BYYEARDAY=-1 → Dec 31 each year', () => {
    const r = new RRule({
      freq: 'YEARLY',
      byyearday: [-1],
      count: 2,
      dtstart: new Date(2025, 0, 1, 9, 0, 0)
    })
    expect([...r].map(fmt)).toEqual(['2025-12-31 09:00:00', '2026-12-31 09:00:00'])
  })

  test('FREQ=YEARLY;BYWEEKNO=20;BYDAY=MO → Monday of ISO week 20', () => {
    const r = new RRule({
      freq: 'YEARLY',
      byweekno: [20],
      byweekday: ['MO'],
      count: 2,
      dtstart: new Date(2025, 0, 1, 9, 0, 0)
    })
    // ISO week 20: Monday 2025-05-12, Monday 2026-05-11.
    expect([...r].map(fmt)).toEqual(['2025-05-12 09:00:00', '2026-05-11 09:00:00'])
  })

  test('FREQ=YEARLY;BYDAY=20MO (no BYMONTH) → 20th Monday of the year (RFC 5545 example)', () => {
    const r = new RRule({
      freq: 'YEARLY',
      byweekday: [{ day: 'MO', n: 20 }],
      count: 3,
      dtstart: new Date(1997, 4, 19, 9, 0, 0)
    })
    // RFC 5545 §3.8.5.3 example: May 19 1997; May 18 1998; May 17 1999.
    expect([...r].map(fmt)).toEqual([
      '1997-05-19 09:00:00',
      '1998-05-18 09:00:00',
      '1999-05-17 09:00:00'
    ])
  })
})

// ---------------------------------------------------------------------------
// B26  DTSTART with nonzero milliseconds must not skip the first occurrence
// (candidates previously truncated ms to 0 and failed the `>= dtstart` gate).
// ---------------------------------------------------------------------------
describe('B26: DTSTART milliseconds are preserved', () => {
  test('DAILY from a dtstart with ms=500 includes the first occurrence', () => {
    const dtstart = new Date(2025, 5, 1, 9, 0, 0, 500)
    const r = new RRule({ freq: 'DAILY', count: 3, dtstart })
    const out = [...r]
    expect(out.map(fmt)).toEqual([
      '2025-06-01 09:00:00',
      '2025-06-02 09:00:00',
      '2025-06-03 09:00:00'
    ])
    // Milliseconds carried through every occurrence
    expect(out.map((d) => d.valueOf() % 1000)).toEqual([500, 500, 500])
    expect(out[0]!.valueOf()).toBe(dtstart.getTime())
  })

  test('matches(dtstart) is true when dtstart has milliseconds', () => {
    const dtstart = new Date(2025, 5, 1, 9, 0, 0, 123)
    const r = new RRule({ freq: 'DAILY', count: 3, dtstart })
    expect(r.matches(dtstart)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// API-T  the query helpers and dtstart/until options accept DateTime
// (previously a type error even though the runtime coerced via valueOf()).
// ---------------------------------------------------------------------------
describe('API-T: RRule accepts DateTime everywhere a date input is taken', () => {
  test('dtstart/until as DateTime + between/next/matches/take with DateTime args', () => {
    const r = new RRule({
      freq: 'DAILY',
      dtstart: local(2026, 1, 1, 9, 0),
      until: local(2026, 1, 10, 9, 0)
    })
    expect([...r]).toHaveLength(10)

    const win = r.between(local(2026, 1, 3, 0, 0), local(2026, 1, 5, 23, 59))
    expect(win.map(fmt)).toEqual([
      '2026-01-03 09:00:00',
      '2026-01-04 09:00:00',
      '2026-01-05 09:00:00'
    ])

    const n = r.next(local(2026, 1, 4, 10, 0))
    expect(fmt(n!)).toBe('2026-01-05 09:00:00')

    expect(r.matches(local(2026, 1, 5, 9, 0))).toBe(true)
    expect(r.matches(local(2026, 1, 5, 10, 0))).toBe(false)

    expect(r.take(2, local(2026, 1, 8, 0, 0)).map(fmt)).toEqual([
      '2026-01-08 09:00:00',
      '2026-01-09 09:00:00'
    ])
  })
})

// ---------------------------------------------------------------------------
// B20a  Cron DOW `0-7`: 7 must remap to Sunday during range expansion, so
// `0-7` covers every day and `5-7` is Fri,Sat,Sun (Vixie cron).
// ---------------------------------------------------------------------------
describe('B20a: Cron DOW ranges including 7', () => {
  test('"0 12 * * 0-7" matches every day of the week', () => {
    const cron = new Cron('0 12 * * 0-7')
    // 2026-01-12 (Mon) through 2026-01-18 (Sun)
    for (let day = 12; day <= 18; day++) {
      expect(cron.matches(local(2026, 1, day, 12, 0))).toBe(true)
    }
    expect(cron.matches(local(2026, 1, 12, 11, 0))).toBe(false) // wrong hour
  })

  test('"0 12 * * 5-7" matches Fri, Sat, Sun only', () => {
    const cron = new Cron('0 12 * * 5-7')
    expect(cron.matches(local(2026, 1, 16, 12, 0))).toBe(true) // Fri
    expect(cron.matches(local(2026, 1, 17, 12, 0))).toBe(true) // Sat
    expect(cron.matches(local(2026, 1, 18, 12, 0))).toBe(true) // Sun
    expect(cron.matches(local(2026, 1, 15, 12, 0))).toBe(false) // Thu
    expect(cron.matches(local(2026, 1, 12, 12, 0))).toBe(false) // Mon
  })
})

// ---------------------------------------------------------------------------
// B20b  Reversed cron ranges wrap around the field boundary (Vixie cron)
// instead of silently producing an empty set.
// ---------------------------------------------------------------------------
describe('B20b: reversed cron ranges wrap', () => {
  test('months "11-2": "0 0 1 11-2 *" matches Nov–Feb 1st and next() works', () => {
    const cron = new Cron('0 0 1 11-2 *')
    expect(cron.matches(local(2025, 11, 1, 0, 0))).toBe(true)
    expect(cron.matches(local(2025, 12, 1, 0, 0))).toBe(true)
    expect(cron.matches(local(2026, 1, 1, 0, 0))).toBe(true)
    expect(cron.matches(local(2026, 2, 1, 0, 0))).toBe(true)
    expect(cron.matches(local(2026, 3, 1, 0, 0))).toBe(false)
    expect(cron.matches(local(2025, 10, 1, 0, 0))).toBe(false)

    const next = cron.next(local(2025, 10, 15, 12, 0))
    expect(fmt(next)).toBe('2025-11-01 00:00:00')
  })

  test('minutes "50-10" wrap: 50..59 and 0..10', () => {
    const cron = new Cron('50-10 * * * *')
    expect(cron.matches(local(2026, 1, 15, 9, 50))).toBe(true)
    expect(cron.matches(local(2026, 1, 15, 9, 59))).toBe(true)
    expect(cron.matches(local(2026, 1, 15, 9, 0))).toBe(true)
    expect(cron.matches(local(2026, 1, 15, 9, 10))).toBe(true)
    expect(cron.matches(local(2026, 1, 15, 9, 11))).toBe(false)
    expect(cron.matches(local(2026, 1, 15, 9, 49))).toBe(false)
  })

  test('hours "22-2" wrap: 22,23,0,1,2', () => {
    const cron = new Cron('0 22-2 * * *')
    for (const h of [22, 23, 0, 1, 2]) {
      expect(cron.matches(local(2026, 1, 15, h, 0))).toBe(true)
    }
    expect(cron.matches(local(2026, 1, 15, 3, 0))).toBe(false)
    expect(cron.matches(local(2026, 1, 15, 21, 0))).toBe(false)
  })

  test('day-of-month "30-2" wrap: 30,31,1,2', () => {
    const cron = new Cron('0 0 30-2 * *')
    expect(cron.matches(local(2026, 1, 30, 0, 0))).toBe(true)
    expect(cron.matches(local(2026, 1, 31, 0, 0))).toBe(true)
    expect(cron.matches(local(2026, 2, 1, 0, 0))).toBe(true)
    expect(cron.matches(local(2026, 2, 2, 0, 0))).toBe(true)
    expect(cron.matches(local(2026, 1, 15, 0, 0))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// B20c  next()/prev() must search past a full leap cycle so "0 0 29 2 *"
// (Feb 29) resolves; impossible specs still throw with the horizon in the
// error message.
// ---------------------------------------------------------------------------
describe('B20c: Cron leap-year horizon', () => {
  test('next("0 0 29 2 *") from 2026-03-01 finds 2028-02-29', () => {
    const cron = new Cron('0 0 29 2 *')
    const next = cron.next(local(2026, 3, 1, 0, 0))
    expect(fmt(next)).toBe('2028-02-29 00:00:00')
  })

  test('prev("0 0 29 2 *") from 2026-03-01 finds 2024-02-29', () => {
    const cron = new Cron('0 0 29 2 *')
    const prev = cron.prev(local(2026, 3, 1, 0, 0))
    expect(fmt(prev)).toBe('2024-02-29 00:00:00')
  })

  test('impossible "0 0 30 2 *" (Feb 30) still throws, documenting the horizon', () => {
    const cron = new Cron('0 0 30 2 *')
    expect(() => cron.next(local(2026, 1, 15, 12, 0))).toThrow(
      'no matching date found within 1500 days'
    )
  })
})
