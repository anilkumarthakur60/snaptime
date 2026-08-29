import type {
  LocaleCalendar,
  LocaleData,
  LocaleLongDateFormats,
  LocaleRelativeTime,
  WeekStart
} from '../core/types'
import {
  DEFAULT_MONTHS,
  DEFAULT_MONTHS_SHORT,
  DEFAULT_WEEKDAYS,
  DEFAULT_WEEKDAYS_SHORT,
  DEFAULT_WEEKDAYS_MIN
} from '../core/constants'
import { EN } from './default'

/**
 * Resolved locale  every field is guaranteed to be populated, with English
 * fallbacks applied for anything the registered LocaleData omits.
 */
export interface ResolvedLocale {
  calendar: LocaleCalendar
  longDateFormat: LocaleLongDateFormats
  meridiem: (h: number, m: number, isLower: boolean) => string
  months: string[]
  monthsShort: string[]
  name: string
  ordinal: (n: number) => string
  relativeTime: LocaleRelativeTime
  weekdays: string[]
  weekdaysMin: string[]
  weekdaysShort: string[]
  weekStart: WeekStart
}

const _store: Record<string, LocaleData> = { en: EN }
let _default = 'en'

/**
 * Every key of LocaleData, as a checked literal list. `satisfies` rejects
 * entries that are not LocaleData keys, and the `_localeDataKeysComplete`
 * assertion below fails to compile if LocaleData gains a field that is
 * missing here  forcing this list (and the runtime guard) to stay in sync.
 */
const LOCALE_DATA_KEYS = [
  'calendar',
  'longDateFormat',
  'meridiem',
  'months',
  'monthsShort',
  'name',
  'ordinal',
  'relativeTime',
  'weekdays',
  'weekdaysMin',
  'weekdaysShort',
  'weekStart'
] as const satisfies readonly (keyof LocaleData)[]

type MissingLocaleDataKeys = Exclude<keyof LocaleData, (typeof LOCALE_DATA_KEYS)[number]>
// Compile-time completeness check  if this line errors, add the reported
// key(s) to LOCALE_DATA_KEYS (and make sure the built-in EN locale sets them).
const _localeDataKeysComplete: [MissingLocaleDataKeys] extends [never]
  ? true
  : MissingLocaleDataKeys = true
void _localeDataKeysComplete

/** Runtime-checked upgrade of the built-in English locale to Required. */
function completeLocale(data: LocaleData): Required<LocaleData> {
  for (const key of LOCALE_DATA_KEYS) {
    if (data[key] == null) {
      throw new TypeError(`Built-in "en" locale is missing required field "${key}"`)
    }
  }
  return data as Required<LocaleData>
}

const EN_COMPLETE = completeLocale(EN)

function resolve(data: LocaleData | undefined): ResolvedLocale {
  const en = EN_COMPLETE
  const months = data?.months ?? en.months
  const weekdays = data?.weekdays ?? en.weekdays
  return {
    name: data?.name ?? 'en',
    months,
    monthsShort: data?.monthsShort ?? en.monthsShort ?? DEFAULT_MONTHS_SHORT,
    weekdays: weekdays ?? DEFAULT_WEEKDAYS,
    weekdaysShort: data?.weekdaysShort ?? weekdays.map((w) => w.slice(0, 3)),
    weekdaysMin: data?.weekdaysMin ?? weekdays.map((w) => w.slice(0, 2)),
    weekStart: data?.weekStart ?? en.weekStart,
    ordinal: data?.ordinal ?? en.ordinal,
    meridiem: data?.meridiem ?? en.meridiem,
    longDateFormat: { ...en.longDateFormat, ...(data?.longDateFormat ?? {}) },
    relativeTime: { ...en.relativeTime, ...(data?.relativeTime ?? {}) },
    calendar: { ...en.calendar, ...(data?.calendar ?? {}) }
  }
}

export const Locales = {
  /** Register a locale (or update an existing one). */
  register(name: string, data: LocaleData): void {
    _store[name] = { ...data, name: data.name ?? name }
  },

  /** Set the global default locale. Returns the previous default. */
  setDefault(name: string): string {
    if (!_store[name]) throw new RangeError(`Locale "${name}" is not registered`)
    const prev = _default
    _default = name
    return prev
  },

  getDefault(): string {
    return _default
  },

  has(name: string): boolean {
    return Object.prototype.hasOwnProperty.call(_store, name)
  },

  list(): string[] {
    return Object.keys(_store)
  },

  /** Get fully-resolved locale data (with English fallbacks). */
  get(name?: string): ResolvedLocale {
    const key = name ?? _default
    return resolve(_store[key])
  },

  /** Get raw (un-resolved) locale data  `undefined` if not registered. */
  getRaw(name: string): LocaleData | undefined {
    return _store[name]
  },

  /** Reset the registry to only contain English. Used by tests. */
  reset(): void {
    for (const k of Object.keys(_store)) {
      if (k !== 'en') delete _store[k]
    }
    _default = 'en'
  }
}

export { DEFAULT_MONTHS, DEFAULT_WEEKDAYS, DEFAULT_WEEKDAYS_MIN, DEFAULT_WEEKDAYS_SHORT }
