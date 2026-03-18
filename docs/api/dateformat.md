# DateFormat API

Core class for date manipulation, formatting, and queries.

## Constructor

```typescript
new DateFormat(input?: string | number | Date | DateFormat, opts?: { utc?: boolean })
```

## Static Methods

### `parse(input: string, format: string, strict?: boolean): DateFormat`

Parse a date string with a custom format.

```typescript
const date = DateFormat.parse('15/01/2024', 'DD/MM/YYYY')
```

### `now(): DateFormat`

Get current date/time.

## Instance Methods

### Formatting

#### `format(formatStr: string): string`

Format date using custom format tokens.

```typescript
date.format('YYYY-MM-DD HH:mm:ss')
```

#### `toISOString(): string`

Get ISO 8601 formatted string.

### Getters/Setters

#### `get(unit: Unit): number`

Get component value.

#### `set(unit: Unit, value: number): DateFormat`

Set component value (returns new instance).

### Date Arithmetic

#### `add(amount: number, unit: Unit): DateFormat`

Add time units.

#### `subtract(amount: number, unit: Unit): DateFormat`

Subtract time units.

### Period Boundaries

#### `startOf(unit: Unit): DateFormat`

Get start of period.

#### `endOf(unit: Unit): DateFormat`

Get end of period.

### Comparisons

#### `isBefore(other: DateFormat | Date | string): boolean`

#### `isAfter(other: DateFormat | Date | string): boolean`

#### `isSame(other: DateFormat | Date | string): boolean`

#### `isBetween(start: DateFormat | Date, end: DateFormat | Date): boolean`

#### `diff(other: DateFormat | Date, unit: Unit): number`

### Validation

#### `isValid(): boolean`

Check if date is valid.

#### `isUtc(): boolean`

Check if in UTC mode.

### Time Zone

#### `tz(timezone: string): DateFormat`

Convert to timezone.

See [DateFormat Guide](../guide/dateformat) for extensive examples.
