# Cron Expressions

Parse and evaluate standard 5-field cron expressions.

## Syntax

```
┌──────── minute (0–59)
│ ┌────── hour (0–23)
│ │ ┌──── day of month (1–31)
│ │ │ ┌── month (1–12)
│ │ │ │ ┌ day of week (0–7, 0 and 7 = Sun)
* * * * *
```

Supports: `*`, `,` lists, `-` ranges, `/` steps, and `MON`–`SUN` abbreviations.

```typescript
import { Cron } from '@anilkumarthakur/d8'

new Cron('* * * * *')    // ✓ valid
new Cron('* * * *')      // → throws (too few fields)
new Cron('* * * * * *')  // → throws (too many fields)
```

## Matching

```typescript
// Every 15 minutes:
const c = new Cron('*/15 * * * *')
c.matches(date_at_min_0)   // → true
c.matches(date_at_min_15)  // → true
c.matches(date_at_min_1)   // → false

// Lists:
new Cron('0,30 * * * *').matches(date_at_min_0)  // → true
new Cron('0,30 * * * *').matches(date_at_min_30) // → true

// DOW 7 = Sunday (same as 0):
new Cron('* * * * 7').matches(sunday) // → true
new Cron('* * * * 0').matches(sunday) // → true

// DOW wraparound (Fri-Mon):
new Cron('* * * * 5-1').matches(friday) // → true
new Cron('* * * * 5-1').matches(tuesday) // → false
```

### DOM + DOW: OR Logic

When both day-of-month and day-of-week are non-wildcard, matching uses **OR** logic:

```typescript
const c = new Cron('0 0 15 * 1') // day 15 OR Monday
c.matches(jan_15_thu_midnight) // → true  (day=15)
c.matches(jan_12_mon_midnight) // → true  (Monday)
c.matches(jan_13_tue_midnight) // → false (neither)
```

## Finding Occurrences

```typescript
// next:
new Cron('*/5 * * * *').next(date_9_00)
// → 9:05

// prev:
new Cron('*/5 * * * *').prev(date_9_05)
// → 9:00

// between:
new Cron('0 * * * *').between(date_9_00, date_12_00)
// → [9:00, 10:00, 11:00, 12:00] (4 matches)

new Cron('0 * * * *').between(date_9_00, date_12_00, 2)
// → [9:00, 10:00] (limited to 2)

// Impossible → throws:
new Cron('0 0 32 * *').next(from) // → throws "No matching date found within 366 days"
```

## Humanize

```typescript
new Cron('* * * * *').humanize()     // → "Every minute"
new Cron('30 * * * *').humanize()    // → "At minute 30 past every hour"
new Cron('0 9 * * *').humanize()     // → "At 09:00"
new Cron('0 9 * * 1-5').humanize()   // → "At 09:00, Monday through Friday"
new Cron('0 9 * 3 *').humanize()     // → contains "March"
new Cron('0 9,17 * * *').humanize()  // → contains "09:00" and "17:00"
```

## toString

```typescript
new Cron('30 9 * * 1-5').toString()    // → "30 9 * * 1-5"
new Cron('  0 0 * * *  ').toString()   // → "0 0 * * *" (trimmed)
```

## Common Patterns

| Expression | Description |
|:-----------|:-----------|
| `* * * * *` | Every minute |
| `0 * * * *` | Every hour |
| `0 0 * * *` | Daily at midnight |
| `0 9 * * 1-5` | Weekdays at 9 AM |
| `*/15 * * * *` | Every 15 minutes |
| `0 0 1 * *` | First of every month |
| `0 0 * * 0` | Every Sunday |
