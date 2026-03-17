import DateFormat from './DateFormat'
import Duration from './Duration'
import DateRange from './DateRange'
import DateCollection from './DateCollection'
import Timezone from './Timezone'
import Cron from './Cron'
import parseNatural from './NaturalLanguage'
import {
  isBusinessDay,
  addBusinessDays,
  subtractBusinessDays,
  nextBusinessDay,
  prevBusinessDay,
  businessDaysBetween,
  getHolidays
} from './BusinessDay'
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
  DateFormatStatic
} from './type'

// ─────────────────────────────────────────────────────────────────────────────
// Factory function — main entry point
// ─────────────────────────────────────────────────────────────────────────────

const dateFormat = Object.assign(
  (input: string | number | Date | DateFormat = Date.now(), opts: { utc?: boolean } = {}) => {
    return new DateFormat(input, opts)
  },
  {
    // Core static methods
    parse:    (str: string, fmt: string, strict?: boolean) => DateFormat.parse(str, fmt, strict),
    min:      (...args: (string | number | Date | DateFormat)[]) => DateFormat.min(...args),
    max:      (...args: (string | number | Date | DateFormat)[]) => DateFormat.max(...args),
    duration: (n: number, unit: Unit) => DateFormat.duration(n, unit),
    locale:   (name: string, data?: LocaleData) => DateFormat.locale(name, data),
    use:      (plugin: PluginFn) => DateFormat.use(plugin),

    // Date range
    range: (
      start: string | number | Date | DateFormat,
      end: string | number | Date | DateFormat
    ) => new DateRange(start, end),

    // Natural language
    natural: (input: string, ref?: DateFormat) => parseNatural(input, ref),

    // Cron
    cron: (expression: string) => new Cron(expression),

    // Collection
    collection: (dates: (string | number | Date | DateFormat)[]) => new DateCollection(dates),

    // Timezone
    tz: (timezone: string) => new Timezone(timezone),

    // Business days
    business: {
      isBusinessDay,
      addBusinessDays,
      subtractBusinessDays,
      nextBusinessDay,
      prevBusinessDay,
      businessDaysBetween,
      getHolidays
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Named exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  // Classes
  DateFormat,
  Duration,
  DateRange,
  DateCollection,
  Timezone,
  Cron,

  // Functions
  parseNatural,
  isBusinessDay,
  addBusinessDays,
  subtractBusinessDays,
  nextBusinessDay,
  prevBusinessDay,
  businessDaysBetween,
  getHolidays,

  // Factory
  dateFormat
}

// ─────────────────────────────────────────────────────────────────────────────
// Type exports
// ─────────────────────────────────────────────────────────────────────────────

export type {
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
  DateFormatStatic
}

export default dateFormat
