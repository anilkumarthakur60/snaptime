import DateFormat from './DateFormat'
import Duration from './Duration'
import type { Unit, PluginFn, LocaleData, DateFormatStatic } from './type'

const dateFormat: DateFormatStatic = Object.assign(
  (input: string | number | Date | DateFormat = Date.now(), opts: { utc?: boolean } = {}) => {
    return new DateFormat(input, opts)
  },
  {
    parse: DateFormat.parse,
    min: DateFormat.min,
    max: DateFormat.max,
    duration: DateFormat.duration,
    locale: DateFormat.locale,
    defineLocale: DateFormat.defineLocale,
    updateLocale: DateFormat.updateLocale,
    localeData: DateFormat.localeData,
    use: DateFormat.use,
    isMoment: DateFormat.isMoment,
    isDate: DateFormat.isDate,
    normalizeUnits: DateFormat.normalizeUnits
  }
)

export { DateFormat, Duration, Unit, PluginFn, LocaleData, dateFormat }
