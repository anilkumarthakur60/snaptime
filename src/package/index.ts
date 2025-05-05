// src/index.ts

import DateFormat, { Duration } from "./DateFormat";
import type { Unit, PluginFn, LocaleData } from "./DateFormat";

export interface DateFormatStatic {
  (
    input?: string | number | Date | DateFormat,
    opts?: { utc?: boolean },
  ): DateFormat;
  parse(str: string, fmt: string, strict?: boolean): DateFormat;
  min(...args: (string | number | Date | DateFormat)[]): DateFormat;
  max(...args: (string | number | Date | DateFormat)[]): DateFormat;
  duration(n: number, unit: Unit): Duration;
  locale(name: string, data?: LocaleData): void;
  use(plugin: PluginFn): typeof DateFormat;
}

const dateFormat = ((
  input: string | number | Date | DateFormat = Date.now(),
  opts: { utc?: boolean } = {},
) => new DateFormat(input, opts)) as DateFormatStatic;

// Attach static methods
dateFormat.parse = DateFormat.parse;
dateFormat.min = DateFormat.min;
dateFormat.max = DateFormat.max;
dateFormat.duration = DateFormat.duration;
dateFormat.locale = DateFormat.locale;
dateFormat.use = DateFormat.use;

export { DateFormat, Duration, Unit, PluginFn, LocaleData, dateFormat };
