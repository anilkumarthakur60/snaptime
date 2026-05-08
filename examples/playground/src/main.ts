import {
  dateTime,
  Duration,
  DateRange,
  Cron,
  parseNatural,
  isBusinessDay
} from '@anil-labs/snaptime'
import '@anil-labs/snaptime/locale/fr'

const out: string[] = []
const log = (label: string, value: unknown): void => {
  out.push(`${label}\n  ${typeof value === 'string' ? value : JSON.stringify(value)}`)
}

// ── DateTime: format / manipulate ───────────────────────────────────
const d = dateTime('2026-01-15T10:30:00')
log('format', d.format('dddd, MMMM D, YYYY h:mm A'))
log('add 3 weeks', d.add(3, 'week').format('YYYY-MM-DD'))
log('startOf month', d.startOf('month').format('YYYY-MM-DD'))

// ── French locale (registered by the side-effect import above) ──────
const fr = d.locale('fr')
if (typeof fr !== 'string') log('french', fr.format('dddd D MMMM YYYY'))

// ── Duration ────────────────────────────────────────────────────────
log('duration 2h30m in minutes', Duration.parse('2h30m').as('minute'))

// ── DateRange ───────────────────────────────────────────────────────
const range = new DateRange('2026-01-01', '2026-01-31')
log('range contains Jan 15', range.contains('2026-01-15'))

// ── Cron ────────────────────────────────────────────────────────────
const cron = new Cron('0 9 * * 1-5')
log('next weekday 9am', cron.next(dateTime('2026-01-15T12:00:00')).toISOString())

// ── Natural language ────────────────────────────────────────────────
log('next friday', parseNatural('next friday', dateTime('2026-01-15')).format('YYYY-MM-DD'))

// ── Business days ───────────────────────────────────────────────────
log('is 2026-01-17 (Sat) a business day', isBusinessDay(dateTime('2026-01-17')))

document.querySelector('#out')!.textContent = out.join('\n\n')
