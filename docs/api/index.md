# API Reference

Complete API documentation for all D8 classes and methods.

## Classes

- [DateFormat](./dateformat) - Core date/time class
- [Duration](./duration) - Time spans and units
- [DateRange](./daterange) - Date range operations
- [DateCollection](./datecollection) - Batch date operations
- [Timezone](./timezone) - Timezone conversions
- [BusinessDay](./businessday) - Business day calculations
- [Cron](./cron) - Cron expression parsing
- [NaturalLanguage](./natural-language) - Human-readable dates

## Quick Reference

### Creating Dates

```typescript
// Current date/time
new DateFormat()

// From string
new DateFormat('2024-01-15')
new DateFormat('2024-01-15T14:30:00Z')

// From Date object
new DateFormat(new Date())

// From timestamp
new DateFormat(1705276800000)
```

### Common Operations

```typescript
// Formatting
date.format('YYYY-MM-DD')

// Arithmetic
date.add(1, 'day')
date.subtract(1, 'week')

// Comparison
date.isBefore(other)
date.isAfter(other)

// Difference
date.diff(other, 'day')

// Timezone
new Timezone('America/New_York')
```

## Type Definitions

```typescript
type Unit =
  | 'millisecond'
  | 'ms'
  | 'second'
  | 'sec'
  | 'minute'
  | 'min'
  | 'hour'
  | 'hr'
  | 'day'
  | 'd'
  | 'week'
  | 'w'
  | 'month'
  | 'mo'
  | 'year'
  | 'yr'

type Period = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
```

## International Support

All classes use English for human-readable output and support UTC/local time operations globally.

## See Also

- [Guide](../guide/) - Tutorials and concepts
- [Examples](../examples/) - Practical code samples
