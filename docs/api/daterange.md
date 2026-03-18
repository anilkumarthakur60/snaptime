# DateRange API

Represents a continuous span between two dates.

## Constructor

```typescript
new DateRange(start: DateFormat | Date | string, end: DateFormat | Date | string)
```

## Instance Methods

### Properties

#### `start: DateFormat`

Start date.

#### `end: DateFormat`

End date.

### Queries

#### `duration(unit?: Unit): Duration`

Get duration of range.

#### `contains(date: DateFormat | Date | string): boolean`

Check if range contains date.

#### `overlaps(other: DateRange): boolean`

Check if overlaps with another range.

#### `isBefore(date: DateFormat | Date | string): boolean`

#### `isAfter(date: DateFormat | Date | string): boolean`

#### `gap(other: DateRange): Duration | null`

Get gap between ranges.

### Iteration

#### `eachDay(): DateFormat[]`

Get array of each day.

#### `eachMonth(): DateFormat[]`

Get array of each month.

#### `eachYear(): DateFormat[]`

Get array of each year.

#### `eachMonthStart(): DateFormat[]`

Get start of each month.

### Formatting

#### `format(formatStr: string): string`

Format both dates.

See [DateRange Guide](../guide/daterange) for extensive examples.
