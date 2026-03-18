# Collections & Ranges

## Sort and Display Events

```typescript
import d8 from '@anilkumarthakur/d8'

const events = d8.collection([
  '2026-12-25',
  '2026-01-01',
  '2026-07-04',
  '2026-03-17',
])

const timeline = events
  .sort('asc')
  .map(d => `${d.format('MMM D')} (${d.format('dddd')})`)

// ["Jan 1 (Thursday)", "Mar 17 (Tuesday)", "Jul 4 (Saturday)", "Dec 25 (Friday)"]
```

## Group Transactions by Month

```typescript
const transactions = d8.collection([
  '2026-01-05', '2026-01-20', '2026-02-14',
  '2026-03-01', '2026-03-18', '2026-03-25',
])

const monthly = transactions.groupBy('month')
for (const [key, dates] of monthly) {
  console.log(`${key}: ${dates.length} transactions`)
}
// "2026-01": 2 transactions
// "2026-02": 1 transactions
// "2026-03": 3 transactions
```

## Find Nearest Event

```typescript
const holidays = d8.collection([
  '2026-01-01', '2026-04-03', '2026-07-04',
  '2026-11-26', '2026-12-25',
])

const today = d8('2026-05-15')
const nearest = holidays.closest(today)
console.log(`Nearest holiday: ${nearest.format('MMM D')}`)
// "Nearest holiday: Apr 3"
```

## Range Overlap Detection

```typescript
const meetings = [
  d8.range('2026-03-18T09:00:00', '2026-03-18T10:00:00'),
  d8.range('2026-03-18T10:30:00', '2026-03-18T11:30:00'),
  d8.range('2026-03-18T11:00:00', '2026-03-18T12:00:00'),
]

// Check for conflicts
for (let i = 0; i < meetings.length; i++) {
  for (let j = i + 1; j < meetings.length; j++) {
    if (meetings[i].overlaps(meetings[j])) {
      console.log(
        `Conflict: ${meetings[i].humanize()} ↔ ${meetings[j].humanize()}`
      )
    }
  }
}
```

## Generate Month Calendar

```typescript
const range = d8.range('2026-01-01', '2026-12-31')
const months = range.toArray('month')

for (const month of months) {
  const days = month.daysInMonth()
  console.log(`${month.format('MMMM YYYY')}: ${days} days`)
}
```

## Split Year into Quarters

```typescript
const year = d8.range('2026-01-01', '2026-12-31')
const quarters = year.split(3, 'month')

for (const q of quarters) {
  console.log(`${q.humanize()} (${q.duration().toDays().toFixed(0)} days)`)
}
// "Jan 1 – Mar 31, 2026 (89 days)"
// "Apr 1 – Jun 30, 2026 (91 days)"
// ...
```

## Deduplicate Dates

```typescript
const logs = d8.collection([
  '2026-03-18T10:00:00', '2026-03-18T10:00:30',
  '2026-03-18T10:01:00', '2026-03-18T11:00:00',
])

// Exact dedup
logs.unique().count()          // 4

// Dedup by minute
logs.unique('minute').count()  // 3

// Dedup by hour
logs.unique('hour').count()    // 2
```
