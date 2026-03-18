# Cron Expressions

`Cron` parses and evaluates cron expressions for scheduling recurring events.

## Cron Expression Format

D8 uses the standard 5-field cron format:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 7) (0 and 7 are Sunday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

## Constructor

```typescript
import { Cron, DateFormat } from '@anilkumarthakur/d8'

// Valid 5-field expressions
const cron1 = new Cron('0 9 * * 1-5')      // 9 AM on weekdays
const cron2 = new Cron('0 0 * * *')        // Midnight every day
const cron3 = new Cron('*/15 * * * *')     // Every 15 minutes
const cron4 = new Cron('0 12 * * 0')       // Noon on Sundays

// Invalid expressions throw errors
try {
  new Cron('0 0 * * * *') // 6 fields (invalid)
} catch (error) {
  console.log('Invalid cron:', error.message)
}
```

## Field Values and Ranges

| Field       | Allowed Values | Aliases           |
| ----------- | -------------- | ----------------- |
| Minute      | 0-59           | -                 |
| Hour        | 0-23           | -                 |
| Day         | 1-31           | -                 |
| Month       | 1-12           | JAN-DEC           |
| Day of Week | 0-7            | SUN-SAT (0,7=Sun) |

## Expression Syntax

### Wildcard (`*`)

Matches any value:

```typescript
new Cron('* * * * *') // Every minute
```

### Specific Value

```typescript
new Cron('0 9 * * *')  // 9 AM every day
new Cron('0 0 15 * *') // Midnight on 15th of each month
```

### List (`,`)

```typescript
new Cron('0 9,17 * * *')        // 9 AM and 5 PM
new Cron('0 * * * 1,3,5')       // Every hour on Mon, Wed, Fri
new Cron('0 0 1,15 * *')        // 1st and 15th of month
```

### Range (`-`)

```typescript
new Cron('0 9-17 * * *')        // Every hour from 9 AM to 5 PM
new Cron('0 0 * * 1-5')         // Midnight Monday to Friday
new Cron('0 0 * 1-3 *')         // Midnight Jan-Mar
```

### Step (`/`)

```typescript
new Cron('*/15 * * * *')        // Every 15 minutes
new Cron('0 */6 * * *')         // Every 6 hours
new Cron('0 0 */2 * *')         // Every 2 days
new Cron('0 0 * * */2')         // Every 2 days of week
```

### Combined

```typescript
new Cron('15-45/5 * * * *')     // Minutes 15, 20, 25, 30, 35, 40, 45
new Cron('0 9-17/2 * * 1-5')    // Hours 9, 11, 13, 15, 17 on weekdays
```

## Matching

Check if a date matches a cron expression:

```typescript
const cron = new Cron('0 9 * * 1-5')
const monday9am = new DateFormat('2024-01-15T09:00:00')
const tuesday3pm = new DateFormat('2024-01-16T15:00:00')

console.log(cron.matches(monday9am)) // true
console.log(cron.matches(tuesday3pm)) // false
```

## Finding Next/Previous Match

```typescript
const cron = new Cron('0 9 * * 1-5')

// Next occurrence
const nextRun = cron.next()
console.log(nextRun.format('YYYY-MM-DD HH:mm'))

// Next after specific date
const from = new DateFormat('2024-01-15')
const nextFromDate = cron.next(from)

// Previous occurrence
const prevRun = cron.prev()
const prevFromDate = cron.prev(from)
```

## Finding All Matches in Range

```typescript
const cron = new Cron('0 * * * *')
const start = new DateFormat('2024-01-01')
const end = new DateFormat('2024-01-02')

// Get all matches between dates
const matches = cron.between(start, end)
console.log(matches.length) // 24 (hourly for 2 days)

// Limit results
const first10 = cron.between(start, end, 10)
console.log(first10.length) // 10
```

## Human-Readable Description

```typescript
const cron = new Cron('0 9 * * 1-5')
console.log(cron.humanize())
// Output: "At 09:00 on Monday through Friday"

const examples = [
  new Cron('* * * * *').humanize(),         // "Every minute"
  new Cron('*/5 * * * *').humanize(),       // "Every 5 minutes"
  new Cron('0 12 * * *').humanize(),        // "At 12:00"
  new Cron('0 0 1 * *').humanize(),         // "At 00:00 on day 1 of month"
  new Cron('0 0 * 1 *').humanize(),         // "At 00:00 on January"
  new Cron('0 * * * 0').humanize()          // "Every hour on Sunday"
]
```

## Common Patterns

```typescript
import { Cron } from '@anilkumarthakur/d8'

// Every day at 9 AM
const dailyNine = new Cron('0 9 * * *')

// Every weekday at 8:30 AM
const weekdayMorning = new Cron('30 8 * * 1-5')

// Every Monday at 9 AM
const mondayMorning = new Cron('0 9 * * 1')

// Every hour
const hourly = new Cron('0 * * * *')

// Every 30 minutes
const halfHourly = new Cron('*/30 * * * *')

// Every 2 hours
const twoHourly = new Cron('0 */2 * * *')

// Midnight every day
const midnight = new Cron('0 0 * * *')

// Noon every day
const noon = new Cron('0 12 * * *')

// 9 to 5, every hour
const businessHours = new Cron('0 9-17 * * 1-5')

// Every 15 minutes during business hours
const frequentBizHours = new Cron('*/15 9-17 * * 1-5')

// First day of month at midnight
const monthlyFirstDay = new Cron('0 0 1 * *')

// Last day of month (approximation)
const monthlyLastDay = new Cron('0 0 28-31 * *')

// Every Sunday at 2 AM
const weeklySunday = new Cron('0 2 * * 0')

// Quarterly (roughly every 3 months)
const quarterly = new Cron('0 0 1 1,4,7,10 *')

// Every minute (testing only!)
const everyMinute = new Cron('* * * * *')
```

## DOM and DOW Interaction

When both day-of-month (DOM) and day-of-week (DOW) are restricted (not `*`), cron uses OR logic:

```typescript
const cron = new Cron('0 0 15 * 1')
// Matches: Every 15th of month OR every Monday at midnight

// Using AND would require at least one to be wildcard
const mondayOnly = new Cron('0 0 * * 1')
const fifthOnly = new Cron('0 0 15 * *')
```

## Error Handling

```typescript
try {
  new Cron('invalid expression')
} catch (error) {
  console.log('Error:', error.message)
}

// Validate before creating
if (isValidCronExpression(expr)) {
  const cron = new Cron(expr)
}
```

## Timezone Awareness

```typescript
const cron = new Cron('0 9 * * 1-5')

// Cron uses local time by default
const next = cron.next()

// For UTC control, create DateFormat in UTC
const utcDate = new DateFormat().utc()
const nextUTC = cron.next(utcDate)
```
