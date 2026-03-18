# Cron Expressions

The `Cron` class parses standard 5-field cron expressions, matches dates against them, finds next/previous occurrences, lists matches in a range, and generates human-readable descriptions.

## Creating Cron Instances

```typescript
import d8, { Cron } from '@anilkumarthakur/d8'

const job = new Cron('30 9 * * 1-5')       // 9:30 AM, Mon–Fri
const daily = new Cron('0 0 * * *')         // midnight every day
const hourly = new Cron('0 * * * *')        // top of every hour
const everyMin = new Cron('* * * * *')      // every minute

// Via factory
const cron = d8.cron('0 9 * * 1-5')
```

## Cron Syntax

```
┌───────────── minute (0–59)
│ ┌───────────── hour (0–23)
│ │ ┌───────────── day of month (1–31)
│ │ │ ┌───────────── month (1–12)
│ │ │ │ ┌───────────── day of week (0–6, Sun=0)
│ │ │ │ │
* * * * *
```

### Supported Syntax

| Pattern  | Meaning              | Example |
|:---------|:---------------------|:--------|
| `*`      | Any value            | `* * * * *` (every minute) |
| `5`      | Specific value       | `5 * * * *` (at minute 5) |
| `1,3,5`  | List                 | `0 9,12,18 * * *` (9am, noon, 6pm) |
| `1-5`    | Range                | `* * * * 1-5` (Mon–Fri) |
| `*/15`   | Step                 | `*/15 * * * *` (every 15 min) |
| `1-5/2`  | Range + step         | `0 9-17/2 * * *` (9,11,13,15,17) |
| `MON`    | Day name             | `0 9 * * MON` (Monday at 9am) |

### Day Names

Day of week supports abbreviations: `SUN`, `MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`

## Matching

### `matches(date)`

Check if a date matches the cron expression:

```typescript
const job = new Cron('30 9 * * 1-5')

job.matches(d8('2026-03-18').set('hour', 9).set('minute', 30))   // true (Wed 9:30)
job.matches(d8('2026-03-18').set('hour', 10).set('minute', 0))   // false
job.matches(d8('2026-03-21').set('hour', 9).set('minute', 30))   // false (Saturday)
```

::: info DOM + DOW Logic
When **both** day-of-month and day-of-week are specified (neither is `*`), a date matches if **either** condition is true (OR logic). When only one is specified, the other must match (AND logic). This follows standard cron behavior.
:::

## Finding Occurrences

### `next(from?)`

Find the next matching date/time after the given date (or now):

```typescript
const job = new Cron('0 9 * * 1-5')

const next = job.next()  // next weekday at 9:00
console.log(next.format('YYYY-MM-DD HH:mm'))

// From a specific starting point
const nextFrom = job.next(d8('2026-03-18'))
```

### `prev(from?)`

Find the most recent past match:

```typescript
const prev = job.prev()
console.log(prev.format('YYYY-MM-DD HH:mm'))
```

### `between(start, end, limit?)`

List all matches in a date range:

```typescript
const job = new Cron('0 9 * * 1-5')
const matches = job.between(
  d8('2026-03-16'),
  d8('2026-03-20')
)
// 5 matches: Mon–Fri at 09:00

// With a limit
const first3 = job.between(d8('2026-03-01'), d8('2026-03-31'), 3)
// Only the first 3 matches
```

## Humanize

### `humanize()`

Get a human-readable description:

```typescript
new Cron('* * * * *').humanize()
// "Every minute"

new Cron('30 9 * * 1-5').humanize()
// "At 09:30, Monday through Friday"

new Cron('0 0 1 * *').humanize()
// "At 00:00, on day 1 of every month"

new Cron('0 9,17 * * *').humanize()
// "At 09:00, 17:00"

new Cron('*/15 * * * *').humanize()
// "At minute 0, 15, 30, 45 past every hour"

new Cron('0 0 * * 0').humanize()
// "At 00:00, Sunday"

new Cron('0 0 1 1 *').humanize()
// "At 00:00, on day 1 of every month, in January"
```

## `toString()`

```typescript
const job = new Cron('30 9 * * 1-5')
job.toString()  // "30 9 * * 1-5"
```

## Common Patterns

| Expression | Description |
|:-----------|:------------|
| `* * * * *` | Every minute |
| `0 * * * *` | Every hour |
| `0 0 * * *` | Daily at midnight |
| `0 9 * * 1-5` | Weekdays at 9am |
| `0 0 1 * *` | 1st of every month |
| `0 0 * * 0` | Every Sunday |
| `*/5 * * * *` | Every 5 minutes |
| `0 9-17 * * 1-5` | Hourly, 9am–5pm, weekdays |
| `30 4 1,15 * *` | 4:30am on 1st and 15th |
| `0 0 1 1 *` | New Year's Day midnight |

## Next Steps

- [Natural Language](./natural-language) — Parse dates from English phrases
- [API Reference](../api/cron) — Complete method signatures
