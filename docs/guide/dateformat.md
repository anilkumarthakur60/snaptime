# DateFormat

`DateFormat` is the core class for working with dates in D8. It provides comprehensive date manipulation, formatting, and query capabilities.

## Constructor

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

// Current date/time
const now = new DateFormat()

// From ISO string
const date1 = new DateFormat('2024-01-15')
const date2 = new DateFormat('2024-01-15T14:30:00Z')

// From Date object
const date3 = new DateFormat(new Date())

// From milliseconds
const date4 = new DateFormat(1705276800000)

// With options
const utcDate = new DateFormat('2024-01-15', { utc: true })
```

## UTC vs Local Mode

```typescript
// UTC mode (safe for server-side operations)
const utcDate = new DateFormat('2024-01-15T12:00:00Z') // Always UTC
console.log(utcDate.isUtc()) // true

// Local mode (unsafe for DST/timezone variations)
const localDate = new DateFormat(new Date(2024, 0, 15, 12, 0, 0))
console.log(localDate.isLocal()) // true
```

## Formatting

D8 supports extensive formatting tokens:

| Token  | Description           | Example      |
| ------ | --------------------- | ------------ |
| `YYYY` | 4-digit year          | 2024         |
| `YY`   | 2-digit year          | 24           |
| `MM`   | Month (01-12)         | 01           |
| `M`    | Month (1-12)          | 1            |
| `MMMM` | Full month name       | January      |
| `MMM`  | Short month name      | Jan          |
| `DD`   | Day of month (01-31)  | 15           |
| `D`    | Day of month (1-31)   | 15           |
| `dddd` | Full weekday name     | Monday       |
| `ddd`  | Short weekday name    | Mon          |
| `HH`   | Hour (00-23)          | 14           |
| `H`    | Hour (0-23)           | 14           |
| `hh`   | Hour (01-12)          | 02           |
| `h`    | Hour (1-12)           | 2            |
| `mm`   | Minute (00-59)        | 30           |
| `m`    | Minute (0-59)         | 30           |
| `ss`   | Second (00-59)        | 45           |
| `s`    | Second (0-59)         | 45           |
| `A`    | AM/PM                 | PM           |
| `a`    | am/pm                 | pm           |
| `DDD`  | Day of year (001-366) | 015          |
| `DDD`  | Day of year (1-366)   | 15           |
| `Z`    | Timezone offset       | +0000, +0530 |

### Formatting Examples

```typescript
const date = new DateFormat('2024-01-15T14:30:45Z')

// Date formats
console.log(date.format('YYYY-MM-DD')) // 2024-01-15
console.log(date.format('DD/MM/YY')) // 15/01/24
console.log(date.format('MM/DD/YYYY')) // 01/15/2024

// Time formats
console.log(date.format('HH:mm:ss')) // 14:30:45
console.log(date.format('h:mm A')) // 2:30 PM
console.log(date.format('hh:mm:ss a')) // 02:30:45 pm

// Combined formats
console.log(date.format('dddd, MMMM D, YYYY')) // Monday, January 15, 2024
console.log(date.format('YYYY-MM-DD HH:mm:ss')) // 2024-01-15 14:30:45

// With timezone
const nyDate = date.tz('America/New_York')
console.log(nyDate.format('YYYY-MM-DD HH:mm:ss Z')) // 2024-01-15 09:30:45 -0500
```

## Parsing

```typescript
// Parse with custom format
const date1 = DateFormat.parse('15/01/2024', 'DD/MM/YYYY')
const date2 = DateFormat.parse('2024-01', 'YYYY-MM')
const date3 = DateFormat.parse('Jan 15, 2024 2:30 PM', 'MMM D, YYYY h:mm A')

// Strict mode validates bounds
const valid = DateFormat.parse('2024-02-15', 'YYYY-MM-DD', true)
const invalid = DateFormat.parse('2024-02-30', 'YYYY-MM-DD', true) // Invalid

// Check validity
if (invalid.isValid()) {
  console.log(invalid.format('YYYY-MM-DD'))
} else {
  console.log('Invalid date')
}
```

## Getters and Setters

```typescript
const date = new DateFormat('2024-01-15T14:30:45.500Z')

// Getters
console.log(date.get('year')) // 2024
console.log(date.get('month')) // 1
console.log(date.get('date')) // 15
console.log(date.get('hour')) // 14
console.log(date.get('minute')) // 30
console.log(date.get('second')) // 45
console.log(date.get('millisecond')) // 500
console.log(date.get('day')) // 1 (Monday)

// Setters (return new instance)
const newDate = date
  .set('year', 2025)
  .set('month', 6)
  .set('date', 20)
  .set('hour', 10)
```

## Date Arithmetic

```typescript
const date = new DateFormat('2024-01-15')

// Add time
console.log(date.add(1, 'day').format('YYYY-MM-DD')) // 2024-01-16
console.log(date.add(1, 'week').format('YYYY-MM-DD')) // 2024-01-22
console.log(date.add(1, 'month').format('YYYY-MM-DD')) // 2024-02-15
console.log(date.add(1, 'year').format('YYYY-MM-DD')) // 2025-01-15

// Subtract time
console.log(date.subtract(7, 'day').format('YYYY-MM-DD')) // 2024-01-08
console.log(date.subtract(1, 'month').format('YYYY-MM-DD')) // 2023-12-15

// Multiple operations (chainable)
const result = date
  .add(1, 'week')
  .subtract(2, 'day')
  .add(3, 'hour')
```

## Start/End of Period

```typescript
const date = new DateFormat('2024-01-15T14:30:45Z')

// Start of period
console.log(date.startOf('day').format('YYYY-MM-DD HH:mm:ss')) // 2024-01-15 00:00:00
console.log(date.startOf('week').format('YYYY-MM-DD')) // 2024-01-14 (Sunday)
console.log(date.startOf('month').format('YYYY-MM-DD')) // 2024-01-01
console.log(date.startOf('year').format('YYYY-MM-DD')) // 2024-01-01

// End of period
console.log(date.endOf('day').format('YYYY-MM-DD HH:mm:ss')) // 2024-01-15 23:59:59
console.log(date.endOf('week').format('YYYY-MM-DD')) // 2024-01-20 (Saturday)
console.log(date.endOf('month').format('YYYY-MM-DD')) // 2024-01-31
console.log(date.endOf('year').format('YYYY-MM-DD')) // 2024-12-31
```

## Comparisons

```typescript
const date1 = new DateFormat('2024-01-15')
const date2 = new DateFormat('2024-01-20')

// Compare
console.log(date1.isBefore(date2)) // true
console.log(date1.isAfter(date2)) // false
console.log(date1.isSame(date2)) // false
console.log(date1.isSameOrBefore(date2)) // true
console.log(date1.isAfterOrEqual(date2)) // false

// Between
console.log(date1.isBetween(date2, date1.add(10, 'day'))) // false

// Difference
const diff = date2.diff(date1, 'day') // 5
```

## Relative Time

```typescript
const date = new DateFormat('2024-01-10')
const now = new DateFormat('2024-01-15')

// Relative to now
console.log(date.fromNow()) // e.g., "5 days ago"
console.log(date.toNow()) // e.g., "in 5 days"

// Relative to specific date
console.log(date.from(now)) // "5 days ago"
console.log(date.to(now)) // "5 days later"
```

## Utilities

```typescript
const date = new DateFormat('2024-01-15T14:30:45.500Z')

// Clone
const copy = date.clone()

// Validity
console.log(date.isValid()) // true

// Timestamps
console.log(date.valueOf()) // milliseconds
console.log(date.unix()) // seconds

// Conversion
console.log(date.toDate()) // JavaScript Date object
console.log(date.toISOString()) // ISO string
```

## Timezone Support

See [Timezone](./timezone) for comprehensive timezone handling.

```typescript
const date = new DateFormat('2024-01-15T14:30:00Z')

// Quick timezone conversion
const nyTime = date.tz('America/New_York')
console.log(nyTime.format('HH:mm')) // 09:30

// With offset
const kolkataTime = date.tz('Asia/Kolkata')
console.log(kolkataTime.format('HH:mm')) // 20:00
```
