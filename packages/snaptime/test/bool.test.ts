import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import dateFormat from '../src/index'

// Pin "now" to a deterministic instant so isCurrent*/isNext*/isLast* are stable.
const FAKE_NOW = '2025-05-04T12:00:00Z'

describe('dateFormat boolean predicates', () => {
  beforeAll(() => {
    dateFormat.setTestNow(FAKE_NOW)
  })

  afterAll(() => {
    dateFormat.setTestNow(null)
  })

  // ─── Validity / mode ──────────────────────────────────────────────────────
  test('isValid', () => {
    expect(dateFormat('2025-05-04').isValid()).toBe(true)
    expect(dateFormat('foo').isValid()).toBe(false)
    expect(dateFormat('2025-05-32').isValid()).toBe(false)
    expect(dateFormat('2025-05-04T12:00:00Z').isValid()).toBe(true)
    expect(dateFormat('2025-05-04T12:00:00').isValid()).toBe(true)
  })

  test('isUtc / isLocal', () => {
    expect(dateFormat('2025-05-04T12:00:00Z').isUtc()).toBe(true)
    expect(dateFormat('2025-05-04T12:00:00Z').isLocal()).toBe(false)
    expect(dateFormat('2025-05-04 12:00:00').isUtc()).toBe(false)
  })

  test('isDST → false in mid-winter UTC', () => {
    expect(dateFormat('2025-01-01T12:00:00Z').isDST()).toBe(false)
  })

  // ─── Day-of-week predicates ───────────────────────────────────────────────
  test('isSunday', () => {
    expect(dateFormat('2025-05-04T12:00:00Z').isSunday()).toBe(true)
    expect(dateFormat('2025-05-05T12:00:00Z').isSunday()).toBe(false)
  })

  test('isMonday', () => {
    expect(dateFormat('2025-05-05T12:00:00Z').isMonday()).toBe(true)
    expect(dateFormat('2025-05-04T12:00:00Z').isMonday()).toBe(false)
  })

  test('isTuesday', () => {
    expect(dateFormat('2025-05-06T12:00:00Z').isTuesday()).toBe(true)
  })

  test('isWednesday', () => {
    expect(dateFormat('2025-05-07T12:00:00Z').isWednesday()).toBe(true)
  })

  test('isThursday', () => {
    expect(dateFormat('2025-05-08T12:00:00Z').isThursday()).toBe(true)
  })

  test('isFriday', () => {
    expect(dateFormat('2025-05-09T12:00:00Z').isFriday()).toBe(true)
  })

  test('isSaturday', () => {
    expect(dateFormat('2025-05-10T12:00:00Z').isSaturday()).toBe(true)
  })

  // ─── isSame* (instance vs instance) ───────────────────────────────────────
  test('isSameYear', () => {
    expect(dateFormat('2025-01-01T12:00:00Z').isSameYear('2025-12-31T12:00:00Z')).toBe(true)
    expect(dateFormat('2025-01-01T12:00:00Z').isSameYear('2026-01-01T12:00:00Z')).toBe(false)
  })

  test('isSameMonth', () => {
    expect(dateFormat('2025-05-01T12:00:00Z').isSameMonth('2025-05-31T12:00:00Z')).toBe(true)
    expect(dateFormat('2025-05-01T12:00:00Z').isSameMonth('2025-06-01T12:00:00Z')).toBe(false)
  })

  test('isSameWeek', () => {
    // 8 days apart → guaranteed different week regardless of week-start convention.
    expect(dateFormat('2025-05-04T12:00:00Z').isSameWeek('2025-05-12T12:00:00Z')).toBe(false)
    // Mon and Wed of the same week → same week in any convention.
    expect(dateFormat('2025-05-05T12:00:00Z').isSameWeek('2025-05-07T12:00:00Z')).toBe(true)
  })

  test('isSameDay', () => {
    expect(dateFormat('2025-05-04T01:00:00Z').isSameDay('2025-05-04T23:00:00Z')).toBe(true)
    expect(dateFormat('2025-05-04T12:00:00Z').isSameDay('2025-05-05T12:00:00Z')).toBe(false)
  })

  test('isSameHour', () => {
    expect(dateFormat('2025-05-04T12:00:00Z').isSameHour('2025-05-04T12:30:00Z')).toBe(true)
    expect(dateFormat('2025-05-04T12:00:00Z').isSameHour('2025-05-04T13:00:00Z')).toBe(false)
  })

  test('isSameMinute', () => {
    expect(dateFormat('2025-05-04T12:00:00Z').isSameMinute('2025-05-04T12:00:30Z')).toBe(true)
    expect(dateFormat('2025-05-04T12:00:00Z').isSameMinute('2025-05-04T12:01:00Z')).toBe(false)
  })

  test('isSameSecond', () => {
    expect(dateFormat('2025-05-04T12:00:00.001Z').isSameSecond('2025-05-04T12:00:00.999Z')).toBe(
      true
    )
    expect(dateFormat('2025-05-04T12:00:00Z').isSameSecond('2025-05-04T12:00:01Z')).toBe(false)
  })

  // ─── isCurrent* / isNext* / isLast* — derived from now ────────────────────
  test('isCurrentYear / isNextYear / isLastYear', () => {
    const now = dateFormat.now()
    expect(now.isCurrentYear()).toBe(true)
    expect(now.add(1, 'year').isNextYear()).toBe(true)
    expect(now.subtract(1, 'year').isLastYear()).toBe(true)
    expect(now.add(1, 'year').isCurrentYear()).toBe(false)
  })

  test('isCurrentMonth / isNextMonth / isLastMonth', () => {
    const now = dateFormat.now()
    expect(now.isCurrentMonth()).toBe(true)
    expect(now.add(1, 'month').isNextMonth()).toBe(true)
    expect(now.subtract(1, 'month').isLastMonth()).toBe(true)
  })

  test('isCurrentWeek / isNextWeek / isLastWeek', () => {
    const now = dateFormat.now()
    expect(now.isCurrentWeek()).toBe(true)
    expect(now.add(1, 'week').isNextWeek()).toBe(true)
    expect(now.subtract(1, 'week').isLastWeek()).toBe(true)
  })

  test('isCurrentQuarter / isNextQuarter / isLastQuarter', () => {
    const now = dateFormat.now()
    expect(now.isCurrentQuarter()).toBe(true)
    expect(now.add(1, 'quarter').isNextQuarter()).toBe(true)
    expect(now.subtract(1, 'quarter').isLastQuarter()).toBe(true)
  })

  test('isToday / isTomorrow / isYesterday', () => {
    const now = dateFormat.now()
    expect(now.isToday()).toBe(true)
    expect(now.add(1, 'day').isTomorrow()).toBe(true)
    expect(now.subtract(1, 'day').isYesterday()).toBe(true)
  })

  // ─── Calendar predicates ──────────────────────────────────────────────────
  test('isLeapYear', () => {
    expect(dateFormat('2024-05-04T12:00:00Z').isLeapYear()).toBe(true)
    expect(dateFormat('2025-05-04T12:00:00Z').isLeapYear()).toBe(false)
    expect(dateFormat('2000-05-04T12:00:00Z').isLeapYear()).toBe(true)
    expect(dateFormat('1900-05-04T12:00:00Z').isLeapYear()).toBe(false)
  })

  test('isSame (no unit) → exact ms equality', () => {
    expect(dateFormat('2025-05-04T12:00:00Z').isSame('2025-05-04T12:00:00Z')).toBe(true)
    expect(dateFormat('2025-05-04T12:00:00Z').isSame('2025-05-04T12:00:01Z')).toBe(false)
  })
})
