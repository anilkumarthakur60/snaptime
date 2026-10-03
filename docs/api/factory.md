# Factory Function

The default export of snaptime is a factory function that creates `DateFormat` instances and provides convenient access to all sub-modules.

## Signature

```typescript
import snaptime from '@anil-labs/snaptime'

snaptime(input?: string | number | Date | DateFormat, opts?: { utc?: boolean }): DateFormat
```

## Creating Dates

```typescript
snaptime()                              // now
snaptime('2026-03-18')                  // from ISO string
snaptime('2026-03-18T14:30:00Z')        // from ISO datetime
snaptime(new Date())                    // from native Date
snaptime(1774022400000)                 // from timestamp
snaptime(existingDateFormat)            // clone
```

## Static Properties

### `snaptime.parse(str, fmt, strict?): DateFormat`
Parse with custom format. See [DateFormat.parse()](./dateformat#static-methods).

### `snaptime.fromObject(obj: DateObject, opts?): DateFormat`
Create a `DateFormat` from a plain object with date components. See [DateFormat.fromObject()](./dateformat#static-methods).

### `snaptime.min(...dates): DateFormat`
Return the earliest date.

### `snaptime.max(...dates): DateFormat`
Return the latest date.

### `snaptime.duration(n, unit): Duration`
Create a Duration.

### `snaptime.locale(name, data?): void`
Register or switch locale.

### `snaptime.use(plugin): DateFormat`
Register a plugin.

### `snaptime.range(start, end): DateRange`
Create a date range.

### `snaptime.natural(input, ref?): DateFormat`
Parse a natural language phrase.

### `snaptime.cron(expression): Cron`
Create a Cron instance.

### `snaptime.collection(dates): DateCollection`
Create a DateCollection.

### `snaptime.tz(timezone): Timezone`
Create a Timezone instance.

### `snaptime.business`

Business day functions:

| Method | Signature |
|:-------|:----------|
| `isBusinessDay` | `(date: DateFormat, holidays?: string[]) => boolean` |
| `addBusinessDays` | `(date: DateFormat, n: number, holidays?: string[]) => DateFormat` |
| `subtractBusinessDays` | `(date: DateFormat, n: number, holidays?: string[]) => DateFormat` |
| `nextBusinessDay` | `(date: DateFormat, holidays?: string[]) => DateFormat` |
| `prevBusinessDay` | `(date: DateFormat, holidays?: string[]) => DateFormat` |
| `businessDaysBetween` | `(start: DateFormat, end: DateFormat, holidays?: string[]) => number` |
| `getHolidays` | `(country: HolidayCountry, year: number) => string[]` |
