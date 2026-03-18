# Quick Start

Let's learn D8 by building a simple date application.

## Basic Date Creation

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

// Create from current date/time
const now = new DateFormat()

// Create from ISO string
const date1 = new DateFormat('2024-01-15')
const date2 = new DateFormat('2024-01-15T14:30:00Z')

// Create from Date object
const date3 = new DateFormat(new Date('2024-01-15'))

// Create from milliseconds
const date4 = new DateFormat(1705276800000)
```

## Formatting Dates

```typescript
const date = new DateFormat('2024-01-15T14:30:00Z')

// ISO format
console.log(date.format('YYYY-MM-DD')) // 2024-01-15
console.log(date.format('YYYY-MM-DD HH:mm:ss')) // 2024-01-15 14:30:00

// Long format
console.log(date.format('dddd, MMMM Do YYYY')) // Monday, January 15th 2024

// Custom format
console.log(date.format('MM/DD/YY')) // 01/15/24
console.log(date.format('h:mm A')) // 2:30 PM
```

## Date Arithmetic

```typescript
const date = new DateFormat('2024-01-15')

// Add time
const nextWeek = date.add(7, 'day')
const nextMonth = date.add(1, 'month')
const tomorrow = date.add(1, 'day')

// Subtract time
const lastWeek = date.subtract(7, 'day')
const lastYear = date.subtract(1, 'year')

// Start/end of period
const startOfMonth = date.startOf('month')
const endOfYear = date.endOf('year')
```

## Working with Durations

```typescript
import { Duration } from '@anilkumarthakur/d8'

// Create a duration
const duration = new Duration(5000) // 5 seconds in milliseconds

// Convert to different units
console.log(duration.as('second')) // 5
console.log(duration.as('minute')) // 0.0833...
console.log(duration.as('hour')) // 0.00138...

// Add to dates
const date = new DateFormat('2024-01-15')
const later = date.add(duration.as('millisecond'), 'millisecond')
```

## Relative Dates

```typescript
const date = new DateFormat('2024-01-15')

// Get human-readable relative time
console.log(date.fromNow()) // e.g., "2 days ago"
console.log(date.toNow()) // e.g., "in 2 days"

// Compare dates
const date2 = new DateFormat('2024-01-20')
console.log(date.isBefore(date2)) // true
console.log(date.isAfter(date2)) // false
console.log(date.isSame(date2)) // false
```

## Timezones

```typescript
import { Timezone } from '@anilkumarthakur/d8'

const date = new DateFormat('2024-01-15T12:00:00Z')

// Work with timezones
const nyTz = new Timezone('America/New_York')
console.log(nyTz.format(date, 'HH:mm')) // 07:00 (UTC-5)

// Get offset information
console.log(nyTz.offsetString(date)) // -05:00
console.log(nyTz.isDST(date)) // false

// Convert between timezones
const kolkataTz = new Timezone('Asia/Kolkata')
console.log(kolkataTz.format(date, 'HH:mm')) // 17:30 (UTC+5:30)
```

## Business Days

```typescript
import { BusinessDay } from '@anilkumarthakur/d8'

const businessDay = new BusinessDay()

// Skip weekends automatically
const monday = new DateFormat('2024-01-15') // Monday
const nextBizDay = businessDay.nextBusinessDay(monday)

// Count business days
const friday = new DateFormat('2024-01-19')
console.log(businessDay.countBusinessDays(monday, friday)) // 5

// Add business days
const date = new DateFormat('2024-01-15')
const fiveDaysLater = businessDay.add(date, 5)
```

## Cron Expressions

```typescript
import { Cron } from '@anilkumarthakur/d8'

// Create a cron expression
const cron = new Cron('0 9 * * 1-5') // 9 AM on weekdays

// Check if date matches
const monday9am = new DateFormat('2024-01-15T09:00:00')
console.log(cron.matches(monday9am)) // true

// Get next match
const nextRun = cron.next()
console.log(nextRun.format('YYYY-MM-DD HH:mm'))

// Get human-readable description
console.log(cron.humanize()) // "At 09:00 on Monday through Friday"
```

## Collections

```typescript
import { DateCollection } from '@anilkumarthakur/d8'

// Create a collection of dates
const dates = new DateCollection([
  '2024-01-15',
  '2024-01-20',
  '2024-01-10'
])

// Sort dates
const sorted = dates.sort('asc')

// Filter dates
const filtered = sorted.filter((date) =>
  date.isAfter(new DateFormat('2024-01-12'))
)

// Map dates
const formatted = filtered.map((date) =>
  date.format('YYYY-MM-DD')
)
```

## What's Next?

- Explore the [Core Concepts](./dateformat) to learn about each class in detail
- Check out [Examples](../examples/) for real-world use cases
- Read the [API Reference](../api/dateformat) for complete documentation
