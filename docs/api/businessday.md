# BusinessDay API

Handle business day calculations excluding weekends and holidays.

## Constructor

```typescript
new BusinessDay(config?: BusinessDayConfig)
```

## Static Methods

### `default(): BusinessDay`

Get default business day (Mon-Fri).

## Instance Methods

### Configuration

#### `setWorkDays(days: number[]): BusinessDay`

Set working days (0=Sunday, 6=Saturday).

#### `setHolidays(dates: (DateFormat | Date | string)[]): BusinessDay`

Set holiday dates.

#### `isWorkDay(date: DateFormat | Date | string): boolean`

Check if date is a work day.

#### `isHoliday(date: DateFormat | Date | string): boolean`

Check if date is a holiday.

### Navigation

#### `next(date: DateFormat, skipHolidays?: boolean): DateFormat`

Get next business day.

#### `prev(date: DateFormat, skipHolidays?: boolean): DateFormat`

Get previous business day.

#### `add(date: DateFormat, days: number): DateFormat`

Add business days.

#### `subtract(date: DateFormat, days: number): DateFormat`

Subtract business days.

### Queries

#### `between(start: DateFormat, end: DateFormat): number`

Count business days between dates.

#### `daysUntil(start: DateFormat, end: DateFormat): number`

Days until target date.

See [BusinessDay Guide](../guide/businessday) for extensive examples.
