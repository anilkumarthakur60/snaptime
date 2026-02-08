import SnapTime from './dateformat/snaptime'
import TimeDuration from './duration/time-duration'
import type { Unit, PluginFn, LocaleData, DateFormatStatic } from './type'

const dateFormat = Object.assign(
  (input: string | number | Date | SnapTime = Date.now(), opts: { utc?: boolean } = {}) => {
    return new SnapTime(input, opts) as any
  },
  {
    parse: SnapTime.parse,
    min: SnapTime.min,
    max: SnapTime.max,
    duration: SnapTime.duration,
    locale: SnapTime.locale,
    defineLocale: SnapTime.defineLocale,
    updateLocale: SnapTime.updateLocale,
    localeData: SnapTime.localeData,
    use: SnapTime.use,
    isMoment: SnapTime.isMoment,
    isDate: SnapTime.isDate,
    normalizeUnits: SnapTime.normalizeUnits
  }
) as DateFormatStatic

export {
  SnapTime,
  TimeDuration,
  SnapTime as DateFormat,
  TimeDuration as Duration,
  dateFormat
}

export type { Unit, PluginFn, LocaleData }
