// Regression tests for audited defects in calendars (Bikram Sambat),
// astronomy, and ecosystem modules. One describe block per finding.
import { describe, test, expect } from 'vitest'
import DateTime from '../src/core/DateTime'
import { BikramSambat, adToBs, bsToAd } from '../src/calendars/bs'
import { BS_FIRST_YEAR, BS_MONTHS } from '../src/calendars/bs/data'
import { springEquinox, summerSolstice, autumnEquinox, winterSolstice } from '../src/astronomy'
import { sunrise, sunset, solarNoon, dayLength } from '../src/astronomy'
import { moonPhase, nextFullMoon } from '../src/astronomy'
import Timezone from '../src/ecosystem/Timezone'
import {
  isBusinessDay,
  addBusinessDays,
  subtractBusinessDays,
  nextBusinessDay,
  prevBusinessDay,
  businessDaysBetween,
  getHolidays
} from '../src/ecosystem/BusinessDay'
import { Holidays } from '../src/ecosystem/holidays/index'
import parseNatural, { NaturalLanguage } from '../src/ecosystem/NaturalLanguage'
import RangeSetDefault, { RangeSet } from '../src/collections/RangeSet'

const isoDay = (d: Date) => d.toISOString().slice(0, 10)

// ─────────────────────────────────────────────────────────────────────────────
// B1 — Bikram Sambat month-length table
// ─────────────────────────────────────────────────────────────────────────────

describe('B1: Bikram Sambat table integrity', () => {
  test('every embedded year sums to 365 or 366 days', () => {
    for (let i = 0; i < BS_MONTHS.length; i++) {
      const sum = BS_MONTHS[i]!.reduce((a, b) => a + b, 0)
      expect([365, 366], `BS year ${BS_FIRST_YEAR + i}`).toContain(sum)
    }
  })

  test('known BS New Year anchors', () => {
    const anchors: [number, string][] = [
      [2000, '1943-04-14'],
      [2070, '2013-04-14'],
      [2072, '2015-04-14'],
      [2076, '2019-04-14'],
      [2077, '2020-04-13'],
      [2080, '2023-04-14'],
      [2081, '2024-04-13'],
      [2082, '2025-04-14']
    ]
    for (const [bsYear, ad] of anchors) {
      expect(isoDay(bsToAd(bsYear, 1, 1)), `BS ${bsYear}-01-01`).toBe(ad)
    }
  })

  test('known AD/BS date pairs round-trip both ways', () => {
    const pairs: [string, [number, number, number]][] = [
      ['2015-09-20', [2072, 6, 3]], // Nepal constitution day
      ['1990-02-18', [2046, 11, 7]],
      ['2008-05-28', [2065, 2, 15]]
    ]
    for (const [ad, [y, m, d]] of pairs) {
      expect(isoDay(bsToAd(y, m, d))).toBe(ad)
      const bs = adToBs(new Date(`${ad}T00:00:00Z`))
      expect([bs.year, bs.month, bs.day]).toEqual([y, m, d])
    }
  })

  test('fromAD(toAD(...)) round-trips across the table', () => {
    for (const y of [2000, 2025, 2046, 2065, 2072, 2081, 2099]) {
      for (let m = 1; m <= 12; m++) {
        for (const d of [1, BikramSambat.daysInMonth(y, m)]) {
          const back = BikramSambat.fromAD(BikramSambat.toAD(y, m, d))
          expect([back.year, back.month, back.day]).toEqual([y, m, d])
        }
      }
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// B2 — equinox/solstice for years < 2000
// ─────────────────────────────────────────────────────────────────────────────

describe('B2: equinox/solstice before 2000', () => {
  const TWO_HOURS = 2 * 3_600_000

  test('springEquinox(1990) is in 1990, near Mar 20 21:19 UTC', () => {
    const d = springEquinox(1990)
    expect(d.getUTCFullYear()).toBe(1990)
    expect(Math.abs(d.getTime() - Date.UTC(1990, 2, 20, 21, 19))).toBeLessThan(TWO_HOURS)
  })

  test('summerSolstice(1999) near Jun 21 19:49 UTC', () => {
    const d = summerSolstice(1999)
    expect(Math.abs(d.getTime() - Date.UTC(1999, 5, 21, 19, 49))).toBeLessThan(TWO_HOURS)
  })

  test('year >= 2000 path unchanged: springEquinox(2025) near Mar 20 09:01 UTC', () => {
    const d = springEquinox(2025)
    expect(Math.abs(d.getTime() - Date.UTC(2025, 2, 20, 9, 1))).toBeLessThan(TWO_HOURS)
  })

  test('all four events fall in the requested year for 1950', () => {
    for (const fn of [springEquinox, summerSolstice, autumnEquinox, winterSolstice]) {
      expect(fn(1950).getUTCFullYear()).toBe(1950)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// B27 — daysInMonth month validation
// ─────────────────────────────────────────────────────────────────────────────

describe('B27: BikramSambat.daysInMonth validates month', () => {
  test('valid months return a number', () => {
    expect(BikramSambat.daysInMonth(2081, 1)).toBe(31)
    expect(BikramSambat.daysInMonth(2081, 12)).toBe(30)
  })

  test('month 0/13/non-integer throw RangeError', () => {
    expect(() => BikramSambat.daysInMonth(2081, 13)).toThrow(RangeError)
    expect(() => BikramSambat.daysInMonth(2081, 0)).toThrow(RangeError)
    expect(() => BikramSambat.daysInMonth(2081, 1.5)).toThrow(RangeError)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// E1 — Timezone.format Z/ZZ tokens
// ─────────────────────────────────────────────────────────────────────────────

describe('E1: Timezone.format renders the zone offset for Z/ZZ', () => {
  const janUtc = new DateTime(Date.UTC(2026, 0, 15, 12, 0, 0))
  const julUtc = new DateTime(Date.UTC(2026, 6, 15, 12, 0, 0))

  test('America/New_York winter → -05:00 / -0500', () => {
    const tz = new Timezone('America/New_York')
    expect(tz.format(janUtc, 'HH:mm Z')).toBe('07:00 -05:00')
    expect(tz.format(janUtc, 'HH:mm ZZ')).toBe('07:00 -0500')
  })

  test('America/New_York summer (DST) → -04:00', () => {
    const tz = new Timezone('America/New_York')
    expect(tz.format(julUtc, 'HH:mm Z')).toBe('08:00 -04:00')
  })

  test('Asia/Kolkata → +05:30', () => {
    const tz = new Timezone('Asia/Kolkata')
    expect(tz.format(janUtc, 'YYYY-MM-DD HH:mm Z')).toBe('2026-01-15 17:30 +05:30')
  })

  test('UTC still renders +00:00 and bracket literals are untouched', () => {
    const tz = new Timezone('UTC')
    expect(tz.format(janUtc, 'HH:mm Z')).toBe('12:00 +00:00')
    expect(new Timezone('Asia/Kolkata').format(janUtc, '[Zone Z] Z')).toBe('Zone Z +05:30')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// E2 — BusinessDay accepts DateInput
// ─────────────────────────────────────────────────────────────────────────────

describe('E2: BusinessDay functions accept DateInput', () => {
  test('isBusinessDay accepts ISO strings', () => {
    expect(isBusinessDay('2026-03-18')).toBe(true) // Wednesday
    expect(isBusinessDay('2026-03-21')).toBe(false) // Saturday
  })

  test('add/subtract/next/prev accept strings and return DateTime', () => {
    expect(addBusinessDays('2026-03-18', 2).format('YYYY-MM-DD')).toBe('2026-03-20')
    expect(subtractBusinessDays('2026-03-18', 1).format('YYYY-MM-DD')).toBe('2026-03-17')
    expect(nextBusinessDay('2026-03-20').format('YYYY-MM-DD')).toBe('2026-03-23')
    expect(prevBusinessDay('2026-03-23').format('YYYY-MM-DD')).toBe('2026-03-20')
    expect(addBusinessDays('2026-03-18', 0)).toBeInstanceOf(DateTime)
  })

  test('businessDaysBetween accepts mixed inputs', () => {
    const n = businessDaysBetween('2026-03-16', new Date(Date.UTC(2026, 2, 20)))
    expect(n).toBe(3)
    expect(businessDaysBetween(new DateTime('2026-03-16'), '2026-03-16')).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// E3 — parseNatural ref accepts DateInput
// ─────────────────────────────────────────────────────────────────────────────

describe('E3: parseNatural ref accepts DateInput', () => {
  test('string ref', () => {
    expect(parseNatural('tomorrow', '2026-03-18').format('YYYY-MM-DD')).toBe('2026-03-19')
  })

  test('Date and timestamp refs', () => {
    const ref = Date.UTC(2026, 2, 18)
    expect(parseNatural('yesterday', new Date(ref)).format('YYYY-MM-DD')).toBe('2026-03-17')
    expect(NaturalLanguage.parse('in 2 days', ref).format('YYYY-MM-DD')).toBe('2026-03-20')
  })

  test('DateTime ref still works', () => {
    expect(parseNatural('tomorrow', new DateTime('2026-03-18')).format('YYYY-MM-DD')).toBe(
      '2026-03-19'
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// E4 — astronomy functions accept DateInput
// ─────────────────────────────────────────────────────────────────────────────

describe('E4: astronomy functions accept DateInput', () => {
  const isoRef = '2026-06-21T12:00:00Z'
  const dateRef = new Date(isoRef)
  const LONDON = { lat: 51.5074, lon: -0.1278 }

  test('sunrise/sunset/solarNoon/dayLength agree across input kinds', () => {
    const a = sunrise(isoRef, LONDON.lat, LONDON.lon)
    const b = sunrise(dateRef, LONDON.lat, LONDON.lon)
    const c = sunrise(new DateTime(isoRef), LONDON.lat, LONDON.lon)
    expect(a?.getTime()).toBe(b?.getTime())
    expect(a?.getTime()).toBe(c?.getTime())
    expect(sunset(isoRef, LONDON.lat, LONDON.lon)?.getTime()).toBe(
      sunset(dateRef, LONDON.lat, LONDON.lon)?.getTime()
    )
    expect(solarNoon(isoRef, LONDON.lat, LONDON.lon)).toBeInstanceOf(Date)
    expect(dayLength(dateRef.getTime(), LONDON.lat, LONDON.lon)).toBeGreaterThan(
      16 * 3_600_000 // long midsummer day in London
    )
  })

  test('moonPhase/nextFullMoon accept strings and DateTime', () => {
    const p1 = moonPhase(isoRef)
    const p2 = moonPhase(new DateTime(isoRef))
    expect(p1.age).toBeCloseTo(p2.age, 10)
    expect(nextFullMoon(isoRef).getTime()).toBe(nextFullMoon(dateRef).getTime())
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// E5 — BikramSambat.fromAD accepts DateInput
// ─────────────────────────────────────────────────────────────────────────────

describe('E5: BikramSambat.fromAD accepts DateInput', () => {
  test('ISO string input', () => {
    const bs = BikramSambat.fromAD('2024-04-13')
    expect([bs.year, bs.month, bs.day]).toEqual([2081, 1, 1])
  })

  test('Date, timestamp and DateTime inputs agree', () => {
    const ms = Date.UTC(2015, 8, 20)
    const fromDate = BikramSambat.fromAD(new Date(ms))
    const fromMs = BikramSambat.fromAD(ms)
    const fromDT = BikramSambat.fromAD(new DateTime(ms))
    for (const bs of [fromDate, fromMs, fromDT]) {
      expect([bs.year, bs.month, bs.day]).toEqual([2072, 6, 3])
    }
  })

  test('format accepts a string too', () => {
    expect(BikramSambat.format('2024-04-13', 'YYYY-MM-DD')).toBe('2081-01-01')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// E6 — unregistered holiday countries
// ─────────────────────────────────────────────────────────────────────────────

describe('E6: unregistered holiday countries return []', () => {
  test('getHolidays keeps its string escape hatch and returns []', () => {
    expect(getHolidays('NZ', 2026)).toEqual([])
  })

  test('Holidays.for on an unregistered country returns []', () => {
    expect(Holidays.for('ZZ', 2026)).toEqual([])
    expect(Holidays.has('ZZ')).toBe(false)
  })

  test('registered countries still resolve', () => {
    expect(getHolidays('US', 2026).length).toBeGreaterThan(0)
    expect(getHolidays('NP', 2026).length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// P1 — RangeSet dual export
// ─────────────────────────────────────────────────────────────────────────────

describe('P1: RangeSet exports both named and default', () => {
  test('named and default exports are the same class', () => {
    expect(RangeSet).toBe(RangeSetDefault)
    expect(new RangeSet().isEmpty()).toBe(true)
  })
})
