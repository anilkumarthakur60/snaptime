# Duration

`Duration` represents a span of time with automatic unit conversion capabilities.

## Constructor

```typescript
import { Duration } from '@anilkumarthakur/d8'

// Create from milliseconds
const d1 = new Duration(5000) // 5 seconds
const d2 = new Duration(300000) // 5 minutes
const d3 = new Duration(3600000) // 1 hour

// Create with unit
const d4 = new Duration(5, 'second')
const d5 = new Duration(30, 'minute')
const d6 = new Duration(2, 'hour')
```

## Supported Units

- `millisecond` / `ms`
- `second` / `sec`
- `minute` / `min`
- `hour` / `hr`
- `day` / `d`
- `week` / `w`
- `month` / `mo`
- `year` / `yr`

## Unit Conversion

```typescript
const duration = new Duration(1, 'hour')

// Convert to different units
console.log(duration.as('millisecond')) // 3600000
console.log(duration.as('second')) // 3600
console.log(duration.as('minute')) // 60
console.log(duration.as('hour')) // 1
console.log(duration.as('day')) // 0.0416...
console.log(duration.as('week')) // 0.00595...
console.log(duration.as('month')) // 0.00136...
console.log(duration.as('year')) // 0.0001140...
```

## Arithmetic

```typescript
const d1 = new Duration(1, 'hour')
const d2 = new Duration(30, 'minute')

// Add durations
const sum = d1.add(d2) // 1.5 hours

// Subtract durations
const diff = d1.subtract(d2) // 0.5 hours

// Multiply
const doubled = d1.multiply(2) // 2 hours

// Divide
const halved = d1.divide(2) // 0.5 hours

// Chain operations
const result = d1
  .add(new Duration(15, 'minute'))
  .subtract(new Duration(5, 'minute'))
```

## Using with DateFormat

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

const date = new DateFormat('2024-01-15')
const duration = new Duration(7, 'day')

// Add duration to date
const later = date.add(duration.as('millisecond'), 'millisecond')

// More convenient helper
const weekLater = date.add(7, 'day')
```

## Queries

```typescript
const duration = new Duration(90, 'minute')

// Check if empty
console.log(duration.isEmpty()) // false

// Get in different formats
console.log(duration.humanize()) // "1 hour, 30 minutes"
console.log(duration.format('HH:mm:ss')) // "01:30:00"

// Negative durations
const negative = new Duration(-5, 'minute')
console.log(negative.isEmpty()) // true (durations are absolute)
```

## Common Patterns

```typescript
// Measure elapsed time
const start = new DateFormat()
// ... do something ...
const end = new DateFormat()
const elapsed = new Duration(end.diff(start, 'millisecond'))
console.log(elapsed.as('second')) // seconds

// Timeout in different units
const timeout = new Duration(30, 'second')
setTimeout(() => {
  console.log('Done')
}, timeout.as('millisecond'))

// Rate calculation
const distance = 100 // km
const time = new Duration(2, 'hour')
const speed = distance / time.as('hour') // 50 km/hour

// Pagination with time
const pageSize = new Duration(10, 'minute')
const totalTime = new Duration(1, 'hour')
const pages = totalTime.as('minute') / pageSize.as('minute') // 6 pages
```
