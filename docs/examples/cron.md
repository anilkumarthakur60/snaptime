# Cron Examples

## Matching Dates

```typescript
import { Cron } from '@anilkumarthakur/d8'

const everyQuarter = new Cron('*/15 * * * *')
// Matches at :00, :15, :30, :45

const weekdays9am = new Cron('0 9 * * 1-5')
// Matches 9:00 AM Monday through Friday

weekdays9am.humanize()
// → "At 09:00, Monday through Friday"
```

## Next / Previous

```typescript
const cron = new Cron('0 9 * * 1') // Monday 9 AM

// From Thursday Jan 15 → next Monday Jan 19:
const next = cron.next(d8('2026-01-15T09:00:00'))
next.format('YYYY-MM-DD HH:mm') // → "2026-01-19 09:00"

// Previous Monday → Jan 12:
const prev = cron.prev(d8('2026-01-15T09:00:00'))
prev.format('YYYY-MM-DD HH:mm') // → "2026-01-12 09:00"
```

## Between (Range Query)

```typescript
const hourly = new Cron('0 * * * *')

const results = hourly.between(
  d8('2026-01-15T09:00:00'),
  d8('2026-01-15T12:00:00')
)
results.length // → 4 (09:00, 10:00, 11:00, 12:00)

// With limit:
hourly.between(
  d8('2026-01-15T09:00:00'),
  d8('2026-01-15T12:00:00'),
  2
).length // → 2
```

## Humanize

```typescript
new Cron('* * * * *').humanize()      // → "Every minute"
new Cron('0 9 * * *').humanize()      // → "At 09:00"
new Cron('30 * * * *').humanize()     // → "At minute 30 past every hour"
new Cron('0 9 * * 1-5').humanize()    // → "At 09:00, Monday through Friday"
new Cron('0 9 * 3 *').humanize()      // → contains "March"
new Cron('0 9,17 * * *').humanize()   // → contains "09:00" and "17:00"
```

## Common Patterns

```typescript
new Cron('* * * * *')      // Every minute
new Cron('0 * * * *')      // Every hour
new Cron('0 0 * * *')      // Daily at midnight
new Cron('0 9 * * 1-5')    // Weekdays at 9 AM
new Cron('*/15 * * * *')   // Every 15 minutes
new Cron('0 0 1 * *')      // First of every month
new Cron('0 0 * * 0')      // Every Sunday
```
