# DateRange API

Start–end date pair with containment, overlap, intersection, splitting, and iteration.

## Constructor

```typescript
new DateRange(
  start: string | number | Date | DateFormat,
  end: string | number | Date | DateFormat
)
```

## Properties

| Property | Type | Description |
|:---------|:-----|:------------|
| `start` | `DateFormat` | Start date (readonly) |
| `end` | `DateFormat` | End date (readonly) |

---

## Instance Methods

### `isValid(): boolean`
Both start and end are valid dates.

### `isForward(): boolean`
`start <= end`.

### `duration(): Duration`
Absolute duration between start and end.

### `contains(date, inclusive?): boolean`

| Param | Type | Default | Description |
|:------|:-----|:--------|:------------|
| `date` | `string \| number \| Date \| DateFormat` | — | Date to check |
| `inclusive` | `boolean` | `true` | Include endpoints |

### `overlaps(other): boolean`
True if ranges share any time.

### `intersect(other): DateRange | null`
Overlapping portion, or `null`.

### `merge(other): DateRange | null`
Combined range, or `null` if no overlap.

### `split(n, unit): DateRange[]`
Split into chunks of `n` units.

### `*iterate(unit): Generator<DateFormat>`
Generator yielding each step.

### `toArray(unit): DateFormat[]`
Collect all dates from `iterate()`.

### `humanize(): string`
e.g. `"Jan 1 – Jun 30, 2026"`.

### `equals(other): boolean`
Same start and end timestamps.

### `toString(): string`
`"YYYY-MM-DD / YYYY-MM-DD"`.

---

See the [DateRange Guide](../guide/daterange) for examples.
