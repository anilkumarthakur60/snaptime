# DateRange

`DateRange` represents a range of dates with iteration, filtering, and aggregation capabilities.

## Constructor

```typescript
import { DateRange, DateFormat } from '@anilkumarthakur/d8'

const start = new DateFormat('2024-01-01')
const end = new DateFormat('2024-01-31')

// Create a range
const range = new DateRange(start, end)

// With inclusive/exclusive bounds
const inclusive = new DateRange(start, end, true) // Both included
const exclusive = new DateRange(start, end, false) // End excluded
```

## Basic Operations

```typescript
const range = new DateRange(
  new DateFormat('2024-01-01'),
  new DateFormat('2024-01-10')
)

// Get bounds
console.log(range.start.format('YYYY-MM-DD')) // 2024-01-01
console.log(range.end.format('YYYY-MM-DD')) // 2024-01-10

// Duration of range
console.log(range.duration()) // Duration object

// Check if date is in range
const date = new DateFormat('2024-01-05')
console.log(range.contains(date)) // true

// Check if ranges overlap
const range2 = new DateRange(
  new DateFormat('2024-01-08'),
  new DateFormat('2024-01-15')
)
console.log(range.overlaps(range2)) // true
```

## Iteration

```typescript
const range = new DateRange(
  new DateFormat('2024-01-01'),
  new DateFormat('2024-01-05')
)

// Iterate by day (default)
for (const date of range.each('day')) {
  console.log(date.format('YYYY-MM-DD'))
}
// Output:
// 2024-01-01
// 2024-01-02
// 2024-01-03
// 2024-01-04
// 2024-01-05

// Iterate by week
for (const date of range.each('week')) {
  console.log(date.format('YYYY-MM-DD'))
}

// Get all dates as array
const allDates = [...range.each('day')]

// Collect with limit
const firstTen = range.each('day', 10) // First 10 dates
```

## Filtering and Mapping

```typescript
const range = new DateRange(
  new DateFormat('2024-01-01'),
  new DateFormat('2024-01-31')
)

// Filter dates
const weekdays = range.filter((date) => {
  const day = date.get('day')
  return day >= 1 && day <= 5 // Monday to Friday
})

// Map dates
const formatted = range.map((date) =>
  date.format('YYYY-MM-DD HH:mm:ss')
)

// Reduce dates
const count = range.reduce((sum) => sum + 1, 0)

// Unique by period
const uniqueMonths = range.unique('month')
```

## Range Operations

```typescript
const range1 = new DateRange(
  new DateFormat('2024-01-01'),
  new DateFormat('2024-01-10')
)

const range2 = new DateRange(
  new DateFormat('2024-01-08'),
  new DateFormat('2024-01-15')
)

// Intersection
const intersection = range1.intersection(range2)
console.log(intersection?.start.format('YYYY-MM-DD')) // 2024-01-08
console.log(intersection?.end.format('YYYY-MM-DD')) // 2024-01-10

// Union (merged range)
const union = range1.union(range2)
console.log(union.start.format('YYYY-MM-DD')) // 2024-01-01
console.log(union.end.format('YYYY-MM-DD')) // 2024-01-15

// Difference
const difference = range1.difference(range2)
```

## Grouping

```typescript
const range = new DateRange(
  new DateFormat('2024-01-01'),
  new DateFormat('2024-03-31')
)

// Group by month
const byMonth = range.groupBy('month')
// Returns Map where keys are month identifiers

// Group by week
const byWeek = range.groupBy('week')

// Group by custom function
const byOddEven = range.groupBy((date) =>
  date.get('date') % 2 === 0 ? 'even' : 'odd'
)

// Iterate over groups
for (const [key, dates] of byMonth) {
  console.log(`Month: ${key}, Count: ${dates.length}`)
}
```

## Common Patterns

```typescript
import { DateRange, DateFormat } from '@anilkumarthakur/d8'

// Get all dates in a month
const date = new DateFormat('2024-01-15')
const start = date.startOf('month')
const end = date.endOf('month')
const daysInMonth = new DateRange(start, end)

// Count weekends in a range
const range = new DateRange(
  new DateFormat('2024-01-01'),
  new DateFormat('2024-01-31')
)
const weekendCount = range.filter((date) => {
  const day = date.get('day')
  return day === 0 || day === 6
}).length

// Find all dates matching a condition
const fridays = range.filter((date) =>
  date.get('day') === 5
)

// Generate payment schedule (e.g., monthly)
const year = new DateFormat('2024-01-01')
const endDate = year.endOf('year')
const range2 = new DateRange(year, endDate)
const paymentDates = [...range2.each('month')]

// Get working hours summary
const workingHours = range.reduce((sum, date) => {
  const day = date.get('day')
  // Skip weekends
  return day >= 1 && day <= 5 ? sum + 8 : sum
}, 0)
```

## Performance Tips

- Use `each()` iterators instead of creating arrays for large ranges
- Filter before mapping to reduce data processing
- Use generators for memory efficiency with large date ranges
