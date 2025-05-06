// src/index.ts

import DateFormat from './DateFormat'
import Duration from './Duration'
import type { Unit, PluginFn, LocaleData } from './type'

const dateFormat = (
  input: string | number | Date | DateFormat = Date.now(),
  opts: { utc?: boolean } = {}
) => new DateFormat(input, opts)

export { DateFormat, Duration, Unit, PluginFn, LocaleData, dateFormat }
