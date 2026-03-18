# DateRange

Start–end date pair with containment, overlap, intersection, splitting, and iteration.

## Creating Ranges

```typescript
import { DateRange, DateFormat } from '@anilkumarthakur/d8'

// All input types supported:
new DateRange('2026-01-01', '2026-01-31')
new DateRange(new Date(2026, 0, 1), new Date(2026, 0, 31))
new DateRange(new DateFormat('2026-01-01'), new DateFormat('2026-01-31'))
new DateRange(1735689600000, 1738281600000) // timestamps

// Or via the factory:
import d8 from '@anilkumarthakur/d8'
const range = d8.range('2026-01-01', '2026-01-31')
```

---

## Validation

```typescript
new DateRange('2026-01-01', '2026-01-31').isValid()   // → true
new DateRange(NaN, '2026-01-31').isValid()             // → false
new DateRange('2026-01-01', NaN).isValid()             // → false

// Forward check:
new DateRange('2026-01-01', '2026-01-31').isForward()  // → true  (start ≤ end)
new DateRange('2026-01-31', '2026-01-01').isForward()  // → false (start > end)
new DateRange('2026-01-01', '2026-01-01').isForward()  // → true  (start === end)
```

---

## Duration

```typescript
const range = new DateRange('2026-01-01', '2026-01-31')
const dur = range.duration()

dur.valueOf() // → 2592000000 (30 days in ms)
dur.toDays()  // → 30

// Always positive, even for reversed ranges:
new DateRange('2026-01-31', '2026-01-01').duration().valueOf()
// → 2592000000 (same absolute value)
```

---

## Contains

```typescript
const range = new DateRange('2026-01-01', '2026-01-31')

range.contains('2026-01-15')           // → true  (inside)
range.contains('2026-01-01')           // → true  (inclusive by default)
range.contains('2026-01-31')           // → true  (inclusive by default)
range.contains('2026-01-01', false)    // → false (exclusive)
range.contains('2026-01-31', false)    // → false (exclusive)
range.contains('2025-12-01')           // → false (before start)
range.contains('2026-02-28')           // → false (after end)

// Reversed ranges still work:
new DateRange('2026-01-31', '2026-01-01').contains('2026-01-15') // → true

// Accepts string, number, Date, or DateFormat:
range.contains(new Date(2026, 0, 15))              // → true
range.contains(new DateFormat('2026-01-15'))        // → true
```

---

## Overlaps

```typescript
const jan = new DateRange('2026-01-01', '2026-01-31')

jan.overlaps(new DateRange('2025-12-01', '2025-12-31'))  // → false (completely before)
jan.overlaps(new DateRange('2026-02-01', '2026-02-28'))  // → false (completely after)
jan.overlaps(new DateRange('2026-01-31', '2026-02-28'))  // → true  (touching boundary)
jan.overlaps(new DateRange('2026-01-15', '2026-02-28'))  // → true  (partial overlap)
jan.overlaps(new DateRange('2026-01-02', '2026-01-15'))  // → true  (one contains other)
jan.overlaps(new DateRange('2026-01-01', '2026-01-31'))  // → true  (identical)
```

---

## Intersect

```typescript
const jan = new DateRange('2026-01-01', '2026-01-31')

// No overlap → null:
jan.intersect(new DateRange('2026-02-01', '2026-02-28'))
// → null

// Partial overlap → shared portion:
const result = jan.intersect(new DateRange('2026-01-15', '2026-02-28'))
result.start.format('YYYY-MM-DD') // → "2026-01-15"
result.end.format('YYYY-MM-DD')   // → "2026-01-31"

// Inner range → the inner range:
const inner = jan.intersect(new DateRange('2026-01-02', '2026-01-15'))
inner.start.format('YYYY-MM-DD')  // → "2026-01-02"
inner.end.format('YYYY-MM-DD')    // → "2026-01-15"
```

---

## Merge

```typescript
const jan = new DateRange('2026-01-01', '2026-01-31')

// No overlap → null:
jan.merge(new DateRange('2026-02-02', '2026-02-28'))
// → null

// Overlapping → union:
const merged = jan.merge(new DateRange('2026-01-15', '2026-02-28'))
merged.start.format('YYYY-MM-DD') // → "2026-01-01"
merged.end.format('YYYY-MM-DD')   // → "2026-02-28"

// Touching boundary → union:
const union = jan.merge(new DateRange('2026-01-31', '2026-02-28'))
union.start.format('YYYY-MM-DD')  // → "2026-01-01"
union.end.format('YYYY-MM-DD')    // → "2026-02-28"
```

---

## Split

```typescript
// 3-day range split by 1 day → 2 chunks:
const range = new DateRange('2026-01-01', '2026-01-03')
const chunks = range.split(1, 'day')
chunks.length // → 2
// chunks[0]: Jan 1 → Jan 2
// chunks[1]: Jan 2 → Jan 3

// 30-day range split by 1 day → 30 chunks:
new DateRange('2026-01-01', '2026-01-31').split(1, 'day').length
// → 30

// Split by month:
new DateRange('2026-01-01', '2026-03-01').split(1, 'month').length
// → 2

// Last chunk is capped at range end:
const fiveDay = new DateRange('2026-01-01', '2026-01-06')
const parts = fiveDay.split(3, 'day')
parts.length // → 2
// parts[1] ends at Jan 6, not Jan 7

// Zero-length range → 0 chunks:
new DateRange('2026-01-01', '2026-01-01').split(1, 'day').length
// → 0
```

---

## Iterate

```typescript
// Jan 1 to Jan 3 → yields 3 dates:
const range = new DateRange('2026-01-01', '2026-01-03')
const dates = [...range.iterate('day')]
dates.length // → 3
// dates[0] = Jan 1, dates[1] = Jan 2, dates[2] = Jan 3

// Reversed ranges iterate low → high:
const reversed = new DateRange('2026-01-03', '2026-01-01')
const revDates = [...reversed.iterate('day')]
revDates.length // → 3
// revDates[0] = Jan 1 (starts from lower bound)

// toArray collects the generator:
range.toArray('day').length // → 3
```

---

## Humanize

```typescript
const range = new DateRange(
  new DateFormat('2026-01-01', { utc: true }),
  new DateFormat('2026-01-31', { utc: true })
)
range.humanize()
// → "Jan 1 – Jan 31, 2026"

// Different years:
new DateRange(
  new DateFormat('2025-12-01', { utc: true }),
  new DateFormat('2026-01-31', { utc: true })
).humanize()
// → "Dec 1, 2025 – Jan 31, 2026"
```

---

## Equality & toString

```typescript
const a = new DateRange('2026-01-01', '2026-01-31')
const b = new DateRange('2026-01-01', '2026-01-31')
const c = new DateRange('2026-01-02', '2026-01-31')

a.equals(b) // → true
a.equals(c) // → false

new DateRange(
  new DateFormat('2026-01-01', { utc: true }),
  new DateFormat('2026-01-31', { utc: true })
).toString()
// → "2026-01-01 / 2026-01-31"
```
