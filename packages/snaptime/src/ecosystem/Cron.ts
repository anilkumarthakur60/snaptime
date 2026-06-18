import DateTime from '../core/DateTime'
import type { CronField, DateInput } from '../core/types'

// ─────────────────────────────────────────────────────────────────────────────
// Vocabulary
// ─────────────────────────────────────────────────────────────────────────────

const DAY_ABBR: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6
}

const MONTH_ABBR: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const MAX_ITER_MINUTES = 366 * 24 * 60

// Search horizon for next()/prev(). Must span a full leap cycle so rules like
// "0 0 29 2 *" (Feb 29) are found — 4 years + margin. Impossible specs (e.g.
// Feb 30) give up after this many days.
const HORIZON_DAYS = 1500

// ─────────────────────────────────────────────────────────────────────────────
// Field parser — turns "*/15" / "1-5" / "MON-FRI" / "1,3,5" into a CronField.
// ─────────────────────────────────────────────────────────────────────────────

function resolveValue(token: string, isDow: boolean, isMonth: boolean): number {
  const upper = token.toUpperCase()
  if (isDow && DAY_ABBR[upper] !== undefined) return DAY_ABBR[upper]
  if (isMonth && MONTH_ABBR[upper] !== undefined) return MONTH_ABBR[upper]
  return parseInt(token, 10)
}

function parseField(
  token: string,
  min: number,
  max: number,
  isDow = false,
  isMonth = false
): CronField {
  if (token === '*' || token === '?') return { values: new Set(), any: true }

  const values = new Set<number>()
  for (const part of token.split(',')) {
    const stepMatch = part.match(/^(.+)\/(\d+)$/)
    let range = part
    let step: number | null = null
    if (stepMatch) {
      range = stepMatch[1]!
      step = parseInt(stepMatch[2]!, 10)
    }

    let lo: number
    let hi: number
    if (range === '*') {
      lo = min
      hi = max
    } else if (range.includes('-')) {
      // `range` contains '-', so split yields at least two entries
      const [a, b] = range.split('-')
      lo = resolveValue(a!, isDow, isMonth)
      hi = resolveValue(b!, isDow, isMonth)
    } else {
      lo = resolveValue(range, isDow, isMonth)
      hi = step != null ? max : lo
    }

    const s = step ?? 1
    // DOW spans 0-7 during expansion with 7 remapped to Sunday as each value
    // is added (Vixie cron) — so `0-7` covers every day, `5-7` is Fri,Sat,Sun.
    const add = (v: number) => values.add(isDow && v === 7 ? 0 : v)
    if (lo <= hi) {
      for (let i = lo; i <= hi; i += s) add(i)
    } else {
      // Reversed range → wrap around the field boundary (Vixie cron):
      // months `11-2` → 11,12,1,2; minutes `50-10` → 50..59,0..10.
      const effMax = isDow ? 7 : max
      const span = effMax - min + 1
      const len = hi - lo + span + 1
      for (let k = 0; k < len; k += s) add(min + ((lo - min + k) % span))
    }
  }

  return { values, any: false }
}

// ─────────────────────────────────────────────────────────────────────────────
// Humanize — produce a friendly description of a cron expression.
// ─────────────────────────────────────────────────────────────────────────────

function fieldDescription(field: CronField, name: string, min: number, max: number): string {
  if (field.any) return `every ${name}`
  const vals = [...field.values].sort((a, b) => a - b)
  if (vals.length === max - min + 1) return `every ${name}`
  return `at ${name} ${vals.join(', ')}`
}

function dowDescription(field: CronField): string {
  if (field.any) return ''
  const vals = [...field.values].sort((a, b) => a - b)
  const consecutive = vals.length > 1 && vals.every((v, i) => i === 0 || v === vals[i - 1]! + 1)
  if (consecutive && vals.length > 2)
    return `${DAY_NAMES[vals[0]!]} through ${DAY_NAMES[vals[vals.length - 1]!]}`
  return vals.map((v) => DAY_NAMES[v]).join(', ')
}

// ─────────────────────────────────────────────────────────────────────────────
// Cron — the public class
// ─────────────────────────────────────────────────────────────────────────────

const PRESETS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *'
}

export default class Cron {
  readonly expression: string
  private readonly minute: CronField
  private readonly hour: CronField
  private readonly dom: CronField
  private readonly month: CronField
  private readonly dow: CronField

  constructor(expression: string) {
    const expanded = PRESETS[expression.trim().toLowerCase()] ?? expression.trim()
    this.expression = expanded
    const parts = expanded.split(/\s+/)
    if (parts.length !== 5) {
      throw new RangeError(`Invalid cron expression: expected 5 fields, got ${parts.length}`)
    }
    this.minute = parseField(parts[0]!, 0, 59)
    this.hour = parseField(parts[1]!, 0, 23)
    this.dom = parseField(parts[2]!, 1, 31)
    this.month = parseField(parts[3]!, 1, 12, false, true)
    this.dow = parseField(parts[4]!, 0, 6, true)
  }

  /** Was this expression created from a preset like `@daily`? */
  static parse(expression: string): Cron {
    return new Cron(expression)
  }

  matches(date: DateInput): boolean {
    const d = date instanceof DateTime ? date : new DateTime(date)
    return this._timeMatches(d) && this._dateMatches(d)
  }

  private _timeMatches(d: DateTime): boolean {
    if (!this.minute.any && !this.minute.values.has(d.get('minute'))) return false
    if (!this.hour.any && !this.hour.values.has(d.get('hour'))) return false
    return true
  }

  private _dateMatches(d: DateTime): boolean {
    if (!this.month.any && !this.month.values.has(d.get('month'))) return false

    const domAny = this.dom.any
    const dowAny = this.dow.any
    const domMatch = domAny || this.dom.values.has(d.get('date'))
    const dowMatch = dowAny || this.dow.values.has(d.get('day'))

    // Cron semantic: when both DOM and DOW are restricted, OR them together
    if (!domAny && !dowAny) return domMatch || dowMatch
    return domMatch && dowMatch
  }

  next(from?: DateInput): DateTime {
    const start = from ? (from instanceof DateTime ? from : new DateTime(from)) : new DateTime()
    let cursor = start.set('second', 0).set('millisecond', 0).add(1, 'minute')
    // Scan day by day (skipping whole days whose date fields cannot match) so
    // rare dates like Feb 29 are found across a full leap cycle.
    for (let day = 0; day < HORIZON_DAYS; day++) {
      if (this._dateMatches(cursor)) {
        const dom = cursor.get('date')
        while (cursor.get('date') === dom) {
          if (this._timeMatches(cursor)) return cursor
          cursor = cursor.add(1, 'minute')
        }
      } else {
        cursor = cursor.add(1, 'day').set('hour', 0).set('minute', 0)
      }
    }
    throw new Error(`Cron.next: no matching date found within ${HORIZON_DAYS} days`)
  }

  prev(from?: DateInput): DateTime {
    const start = from ? (from instanceof DateTime ? from : new DateTime(from)) : new DateTime()
    let cursor = start.set('second', 0).set('millisecond', 0).subtract(1, 'minute')
    for (let day = 0; day < HORIZON_DAYS; day++) {
      if (this._dateMatches(cursor)) {
        const dom = cursor.get('date')
        while (cursor.get('date') === dom) {
          if (this._timeMatches(cursor)) return cursor
          cursor = cursor.subtract(1, 'minute')
        }
      } else {
        cursor = cursor.subtract(1, 'day').set('hour', 23).set('minute', 59)
      }
    }
    throw new Error(`Cron.prev: no matching date found within ${HORIZON_DAYS} days`)
  }

  /** All matches in `[start, end]`, optionally capped at `limit`. */
  between(start: DateInput, end: DateInput, limit?: number): DateTime[] {
    const s = start instanceof DateTime ? start : new DateTime(start)
    const e = end instanceof DateTime ? end : new DateTime(end)
    const out: DateTime[] = []
    let cursor = s.set('second', 0).set('millisecond', 0)
    if (!this.matches(cursor)) cursor = cursor.add(1, 'minute')
    for (let i = 0; i < MAX_ITER_MINUTES; i++) {
      if (cursor.isAfter(e)) break
      if (limit !== undefined && out.length >= limit) break
      if (this.matches(cursor)) out.push(cursor)
      cursor = cursor.add(1, 'minute')
    }
    return out
  }

  humanize(): string {
    if (this.minute.any && this.hour.any && this.dom.any && this.month.any && this.dow.any)
      return 'Every minute'

    if (!this.minute.any && this.hour.any && this.dom.any && this.month.any && this.dow.any) {
      const vals = [...this.minute.values].sort((a, b) => a - b)
      return `At minute ${vals.join(', ')} past every hour`
    }

    const parts: string[] = []
    if (!this.minute.any && !this.hour.any) {
      const mins = [...this.minute.values].sort((a, b) => a - b)
      const hrs = [...this.hour.values].sort((a, b) => a - b)
      const times = hrs.flatMap((h) =>
        mins.map((m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      )
      parts.push(`At ${times.join(', ')}`)
    } else if (!this.minute.any) {
      parts.push(fieldDescription(this.minute, 'minute', 0, 59))
    } else if (!this.hour.any) {
      parts.push(fieldDescription(this.hour, 'hour', 0, 23))
    }

    if (!this.dom.any) {
      parts.push(`on day ${[...this.dom.values].sort((a, b) => a - b).join(', ')} of every month`)
    }
    if (!this.month.any) {
      const vals = [...this.month.values].sort((a, b) => a - b)
      parts.push(`in ${vals.map((v) => MONTH_NAMES[v - 1]).join(', ')}`)
    }
    if (!this.dow.any) parts.push(dowDescription(this.dow))
    return parts.join(', ')
  }

  toString(): string {
    return this.expression
  }
}
