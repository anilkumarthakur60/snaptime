# API Reference

Complete API documentation for the `@anilkumarthakur/d8` library. Every class, function, and type — fully documented.

## Modules

| Module | Description |
|:-------|:------------|
| [Factory](./factory) | The `dateFormat` factory function — the main entry point |
| [DateFormat](./dateformat) | Core date class — 80+ methods |
| [Duration](./duration) | Time span representation |
| [DateRange](./daterange) | Start–end date pair |
| [DateCollection](./datecollection) | Batch operations on date sets |
| [Timezone](./timezone) | IANA timezone support |
| [BusinessDay](./businessday) | Business day calculations |
| [Cron](./cron) | Cron expression parsing |
| [Natural Language](./natural-language) | English phrase parsing |
| [Type Definitions](./types) | All exported TypeScript types |

## Quick Import Reference

```typescript
// Default export: factory function
import d8 from '@anilkumarthakur/d8'

// Named exports: classes
import {
  DateFormat,
  Duration,
  DateRange,
  DateCollection,
  Timezone,
  Cron,
  dateFormat,        // also the factory
} from '@anilkumarthakur/d8'

// Named exports: functions
import {
  parseNatural,
  isBusinessDay,
  addBusinessDays,
  subtractBusinessDays,
  nextBusinessDay,
  prevBusinessDay,
  businessDaysBetween,
  getHolidays,
} from '@anilkumarthakur/d8'

// Type imports
import type {
  Unit,
  SortOrder,
  WeekStart,
  RangeIterateUnit,
  GroupByUnit,
  UniqueUnit,
  HolidayCountry,
  LocaleData,
  LocaleRelativeTime,
  LocaleCalendar,
  PluginFn,
  DateFormatPluginMethods,
  PreciseDiffResult,
  AgeResult,
  CountdownResult,
  CalendarCell,
  CalendarGridOptions,
  FiscalConfig,
  CronField,
  DateFormatStatic,
} from '@anilkumarthakur/d8'
```
