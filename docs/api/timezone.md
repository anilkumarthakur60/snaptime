# Timezone API

Handle timezones and timezone conversions.

## Static Methods

### `get(name: string): Timezone`

Get timezone by name.

```typescript
const tz = Timezone.get('America/New_York')
```

### `local(): Timezone`

Get local timezone.

### `utc(): Timezone`

Get UTC timezone.

### `all(): string[]`

Get all available timezone names.

## Instance Methods

### Properties

#### `name: string`

Timezone name.

#### `abbr(date?: DateFormat): string`

Timezone abbreviation.

### Queries

#### `isDST(date: DateFormat): boolean`

Check if DST is active.

#### `offsetMinutes(date: DateFormat): number`

Get offset in minutes.

#### `offsetString(date: DateFormat): string`

Get offset as string (e.g., "+05:45").

### Conversion

#### `convert(date: DateFormat, toTz: string | Timezone): DateFormat`

Convert date to another timezone.

#### `fromUTC(date: DateFormat): DateFormat`

Convert from UTC to this timezone.

#### `toUTC(date: DateFormat): DateFormat`

Convert from this timezone to UTC.

See [Timezone Guide](../guide/timezone) for extensive examples.
