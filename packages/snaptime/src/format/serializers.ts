// ─────────────────────────────────────────────────────────────────────────────
// Pure serializers for common date interchange formats.
//
// Each serializer takes an optional `utc` flag mirroring DateTime's UTC mode:
// when set, UTC getters are used (the same getter selection the formatter
// uses) and the rendered offset is +00:00  so a UTC-mode instance's
// serialized form agrees with its own format() output.
// ─────────────────────────────────────────────────────────────────────────────

import { DEFAULT_WEEKDAYS_SHORT, DEFAULT_MONTHS_SHORT, EXCEL_EPOCH_MS } from '../core/constants'
import { pad, formatOffset, getOffsetMinutes } from '../core/helpers'

interface WallClock {
  date: number
  day: number
  hours: number
  minutes: number
  month: number
  offsetMinutes: number
  seconds: number
  year: number
}

function wallClock(d: Date, utc: boolean): WallClock {
  return utc
    ? {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth(),
        date: d.getUTCDate(),
        day: d.getUTCDay(),
        hours: d.getUTCHours(),
        minutes: d.getUTCMinutes(),
        seconds: d.getUTCSeconds(),
        offsetMinutes: 0
      }
    : {
        year: d.getFullYear(),
        month: d.getMonth(),
        date: d.getDate(),
        day: d.getDay(),
        hours: d.getHours(),
        minutes: d.getMinutes(),
        seconds: d.getSeconds(),
        offsetMinutes: getOffsetMinutes(d)
      }
}

/** RFC 2822, e.g. `Tue, 17 Mar 2026 09:00:00 +0530` (`+0000` in UTC mode). */
export function toRFC2822(d: Date, utc = false): string {
  const c = wallClock(d, utc)
  return (
    `${DEFAULT_WEEKDAYS_SHORT[c.day]}, ` +
    `${pad(c.date)} ${DEFAULT_MONTHS_SHORT[c.month]} ${c.year} ` +
    `${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)} ` +
    formatOffset(c.offsetMinutes, '')
  )
}

/** RFC 3339, e.g. `2026-03-17T09:00:00+05:30` (`…Z` in UTC mode). */
export function toRFC3339(d: Date, utc = false): string {
  const c = wallClock(d, utc)
  const date = `${c.year}-${pad(c.month + 1)}-${pad(c.date)}`
  const time = `${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)}`
  return c.offsetMinutes === 0
    ? `${date}T${time}Z`
    : `${date}T${time}${formatOffset(c.offsetMinutes, ':')}`
}

/** ISO 8601  wrapper for symmetry with the others. */
export function toISO(ms: number): string {
  return new Date(ms).toISOString()
}

/** Excel serial date  fractional days since 1899-12-30. */
export function toExcel(ms: number): number {
  return (ms - EXCEL_EPOCH_MS) / 86_400_000
}

/** From an Excel serial back to milliseconds. */
export function fromExcel(serial: number): number {
  return serial * 86_400_000 + EXCEL_EPOCH_MS
}

/** SQL DATETIME  `YYYY-MM-DD HH:MM:SS`. */
export function toSQL(d: Date, utc = false): string {
  const c = wallClock(d, utc)
  return (
    `${c.year}-${pad(c.month + 1)}-${pad(c.date)} ` +
    `${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)}`
  )
}

/** SQL DATE  `YYYY-MM-DD`. */
export function toSQLDate(d: Date, utc = false): string {
  const c = wallClock(d, utc)
  return `${c.year}-${pad(c.month + 1)}-${pad(c.date)}`
}

/** SQL TIME  `HH:MM:SS`. */
export function toSQLTime(d: Date, utc = false): string {
  const c = wallClock(d, utc)
  return `${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)}`
}
