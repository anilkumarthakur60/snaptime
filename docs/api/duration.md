# Duration API

Represents a span of time with various units and calculations.

## Constructor

```typescript
new Duration(value: number, unit?: Unit)
```

## Static Methods

### `between(start: DateFormat, end: DateFormat, unit?: Unit): Duration`

Calculate duration between two dates.

```typescript
const dur = Duration.between(date1, date2, 'day')
```

### `fromObject(obj: Partial<DurationObject>): Duration`

Create from object with unit values.

## Instance Methods

### Conversion

#### `as(unit: Unit): number`

Get duration in specified unit.

#### `toObject(): DurationObject`

Get as object with all units.

#### `toMilliseconds(): number`

#### `toSeconds(): number`

#### `toMinutes(): number`

#### `toHours(): number`

#### `toDays(): number`

### Arithmetic

#### `add(value: number, unit: Unit): Duration`

Add time.

#### `subtract(value: number, unit: Unit): Duration`

Subtract time.

#### `multiply(factor: number): Duration`

Multiply duration.

#### `divide(divisor: number): Duration`

Divide duration.

### Comparisons

#### `isBefore(other: Duration): boolean`

#### `isAfter(other: Duration): boolean`

#### `isSame(other: Duration): boolean`

### Queries

#### `isPositive(): boolean`

#### `isNegative(): boolean`

#### `isZero(): boolean`

See [Duration Guide](../guide/duration) for extensive examples.
