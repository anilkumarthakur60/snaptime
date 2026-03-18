# Cron API

Parse and work with cron expressions.

## Constructor

```typescript
new Cron(expression: string)
```

## Instance Methods

### Validation

#### `isValid(): boolean`

Check if cron expression is valid.

#### `validate(): string | null`

Get validation error message if invalid.

### Field Access

#### `minute(): string`

Get minute field.

#### `hour(): string`

Get hour field.

#### `dayOfMonth(): string`

Get day of month field.

#### `month(): string`

Get month field.

#### `dayOfWeek(): string`

Get day of week field.

### Time Navigation

#### `next(from?: DateFormat): DateFormat | null`

Get next execution time.

```typescript
const cron = new Cron('0 9 * * MON') // Every Monday at 9 AM
const nextTime = cron.next() // Next execution
```

#### `prev(from?: DateFormat): DateFormat | null`

Get previous execution time.

#### `between(start: DateFormat, end: DateFormat): DateFormat[]`

Get all executions between dates.

### Queries

#### `willRun(date: DateFormat): boolean`

Check if task will run at this time.

#### `description(): string`

Get human-readable description.

See [Cron Guide](../guide/cron) for extensive examples.
