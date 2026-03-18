# DateCollection

`DateCollection` manages multiple dates with batch operations, filtering, grouping, and aggregation.

## Constructor

```typescript
import { DateCollection, DateFormat } from '@anilkumarthakur/d8'

// From array of strings
const collection1 = new DateCollection([
  '2024-01-15',
  '2024-01-20',
  '2024-01-10'
])

// From array of Date objects
const collection2 = new DateCollection([
  new Date('2024-01-15'),
  new Date('2024-01-20'),
  new Date('2024-01-10')
])

// From array of DateFormat objects
const collection3 = new DateCollection([
  new DateFormat('2024-01-15'),
  new DateFormat('2024-01-20'),
  new DateFormat('2024-01-10')
])

// From array of timestamps
const collection4 = new DateCollection([
  1705276800000,
  1705363200000,
  1705190400000
])

// Mixed types
const collection5 = new DateCollection([
  '2024-01-15',
  new Date('2024-01-20'),
  new DateFormat('2024-01-10'),
  1705363200000
])
```

## Sorting

```typescript
const collection = new DateCollection([
  '2024-01-20',
  '2024-01-10',
  '2024-01-15'
])

// Ascending (default)
const ascending = collection.sort('asc')
// Result: [2024-01-10, 2024-01-15, 2024-01-20]

// Descending
const descending = collection.sort('desc')
// Result: [2024-01-20, 2024-01-15, 2024-01-10]

// Chain operations
const sorted = collection
  .sort('asc')
  .filter(date => date.isAfter(new DateFormat('2024-01-12')))
```

## Filtering

```typescript
const collection = new DateCollection([
  '2024-01-10',
  '2024-01-15',
  '2024-01-20',
  '2024-01-25'
])

// Filter by date range
const filtered = collection.filter(date =>
  date.isAfter(new DateFormat('2024-01-12')) &&
  date.isBefore(new DateFormat('2024-01-22'))
)
// Result: [2024-01-15, 2024-01-20]

// Filter specific dates
const weekends = collection.filter(date => {
  const day = date.get('day')
  return day === 0 || day === 6
})

// Filter by month
const january = collection.filter(date =>
  date.get('month') === 1
)
```

## Mapping

```typescript
const collection = new DateCollection([
  '2024-01-15',
  '2024-01-20',
  '2024-01-10'
])

// Format dates
const formatted = collection.map(date =>
  date.format('YYYY-MM-DD')
)

// Extract data
const data = collection.map(date => ({
  date: date.format('YYYY-MM-DD'),
  day: date.get('day'),
  month: date.get('month')
}))

// Get timestamps
const timestamps = collection.map(date =>
  date.valueOf()
)
```

## Reducing

```typescript
const collection = new DateCollection([
  '2024-01-01',
  '2024-01-05',
  '2024-01-10'
])

// Count dates
const count = collection.reduce((sum) => sum + 1, 0)

// Sum days of month
const sumDays = collection.reduce((sum, date) =>
  sum + date.get('date'), 0
)

// Find oldest date
const oldest = collection.reduce((min, date) =>
  date.isBefore(min) ? date : min
)

// Collect formatted
const formatted = collection.reduce((acc, date) =>
  acc + date.format('YYYY-MM-DD') + '\n', ''
)
```

## Grouping

```typescript
const collection = new DateCollection([
  '2024-01-10',
  '2024-01-15',
  '2024-01-20',
  '2024-02-05',
  '2024-02-15'
])

// Group by month
const byMonth = collection.groupBy(date =>
  date.format('YYYY-MM')
)
// Result:
// '2024-01' => [2024-01-10, 2024-01-15, 2024-01-20]
// '2024-02' => [2024-02-05, 2024-02-15]

// Group by day of week
const byDayOfWeek = collection.groupBy(date =>
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.get('day')]
)

// Group by range
const byRange = collection.groupBy(date => {
  const d = date.get('date')
  if (d <= 10) return 'first-third'
  if (d <= 20) return 'second-third'
  return 'last-third'
})
```

## Uniqueness

```typescript
const collection = new DateCollection([
  '2024-01-15T10:00:00',
  '2024-01-15T14:00:00',
  '2024-01-20T10:00:00'
])

// Unique by day (ignore time)
const uniqueDays = collection.unique(date =>
  date.format('YYYY-MM-DD')
)
// Result: [2024-01-15, 2024-01-20]

// Unique by month
const uniqueMonths = collection.unique(date =>
  date.format('YYYY-MM')
)

// Unique by custom key
const uniqueByRange = collection.unique(date => {
  const d = date.get('date')
  return d <= 15 ? 'first-half' : 'second-half'
})
```

## Array Operations

```typescript
const collection = new DateCollection([
  '2024-01-10',
  '2024-01-15',
  '2024-01-20'
])

// Get as array
const array = collection.toArray()

// Get first
const first = collection.first()

// Get last
const last = collection.last()

// Length
const count = collection.length

// Slice
const sliced = collection.slice(0, 2)

// Include
const included = collection.includes(new DateFormat('2024-01-15'))
```

## Aggregation

```typescript
const collection = new DateCollection([
  '2024-01-10',
  '2024-01-15',
  '2024-01-20',
  '2024-01-25'
])

// Statistics
const stats = {
  count: collection.length,
  first: collection.first(),
  last: collection.last(),
  earliest: collection.sort('asc').first(),
  latest: collection.sort('desc').first()
}

// Range
const range = {
  from: collection.sort('asc').first(),
  to: collection.sort('desc').first()
}

// Calculate span
const first = collection.sort('asc').first()
const last = collection.sort('desc').first()
const days = last.diff(first, 'day')
```

## Real-World Examples

```typescript
import { DateCollection, DateFormat, BusinessDay } from '@anilkumarthakur/d8'

// Remove weekends
const allDates = new DateCollection([
  '2024-01-15', // Monday
  '2024-01-16', // Tuesday
  '2024-01-20', // Saturday
  '2024-01-21'  // Sunday
])

const businessDays = allDates.filter(date => {
  const day = date.get('day')
  return day >= 1 && day <= 5
})

// Count holidays
const holidays = new DateCollection([
  '2024-01-01',
  '2024-07-04',
  '2024-12-25'
])

const holidayCount = holidays.length

// Generate report by month
const dates = new DateCollection([
  '2024-01-15',
  '2024-01-20',
  '2024-02-10',
  '2024-02-28',
  '2024-03-15'
])

const report = {}
dates.groupBy(d => d.format('YYYY-MM')).forEach((dates, month) => {
  report[month] = {
    count: dates.length,
    first: dates.sort('asc')[0],
    last: dates.sort('desc')[0]
  }
})

// Time series
const timeSeries = new DateCollection([
  '2024-01-01T10:00:00',
  '2024-01-01T11:00:00',
  '2024-01-01T12:00:00',
  '2024-01-02T10:00:00'
])

const byHour = timeSeries.map(d => ({
  timestamp: d.format('YYYY-MM-DD HH:00:00'),
  hourOfDay: d.get('hour')
}))

// Availability check
const bookedDates = new DateCollection([
  '2024-02-10',
  '2024-02-15',
  '2024-02-20'
])

const isAvailable = (date: DateFormat) => {
  return !bookedDates.toArray().some(booked =>
    booked.format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
  )
}
```

## Chain Operations

```typescript
const collection = new DateCollection([
  '2024-01-05',
  '2024-01-12',
  '2024-01-20',
  '2024-01-25'
])

// Complex chain
const result = collection
  .filter(date => date.isAfter(new DateFormat('2024-01-10')))
  .sort('desc')
  .map(date => date.format('YYYY-MM-DD'))

// Group and process
const processed = collection
  .groupBy(date => date.format('YYYY-MM'))
  .forEach((dates, month) => {
    console.log(`${month}: ${dates.length} dates`)
  })
```

## Performance Considerations

- Use `.filter()` before `.map()` to reduce data
- For large collections, use generators where possible
- Cache frequently accessed results
- Consider pagination for UI display
