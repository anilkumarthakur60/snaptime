import DateFormat from './DateFormat'
import Duration from './Duration'
import type { Unit, PluginFn, LocaleData, DateFormatStatic } from './type'

// Define the dateFormat function with callable and static properties
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
    use: DateFormat.use,
  }
)

export { DateFormat, Duration, Unit, PluginFn, LocaleData, dateFormat }