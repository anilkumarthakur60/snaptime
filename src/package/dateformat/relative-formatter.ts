/** Relative time and formatting */
export class RelativeTimeFormatter {
  static fromNow(ms: number): string {
    const now = Date.now()
    const diff = ms - now
    const isNegative = diff < 0
    const absMs = Math.abs(diff)

    return RelativeTimeFormatter.formatDiff(absMs, isNegative)
  }

  static from(ms: number, otherMs: number, withoutSuffix = false): string {
    const diff = ms - otherMs
    const isNegative = diff < 0
    const absMs = Math.abs(diff)

    const formatted = RelativeTimeFormatter.formatDiff(absMs, isNegative)
    if (withoutSuffix) {
      return formatted.replace(' ago', '').replace('in ', '')
    }
    return formatted
  }

  static to(ms: number, otherMs: number, withoutSuffix = false): string {
    const diff = otherMs - ms
    const isNegative = diff < 0
    const absMs = Math.abs(diff)

    const formatted = RelativeTimeFormatter.formatDiff(absMs, isNegative)
    if (withoutSuffix) {
      return formatted.replace(' ago', '').replace('in ', '')
    }
    return formatted
  }

  static toNow(ms: number, withoutSuffix = false): string {
    const now = Date.now()
    const diff = now - ms
    const isNegative = diff < 0
    const absMs = Math.abs(diff)

    const formatted = RelativeTimeFormatter.formatDiff(absMs, isNegative)
    if (withoutSuffix) {
      return formatted.replace(' ago', '').replace('in ', '')
    }
    return formatted
  }

  private static formatDiff(absMs: number, isNegative: boolean): string {
    let value: number
    let unit: string

    if (absMs < 1000) {
      value = Math.round(absMs)
      unit = value === 1 ? 'millisecond' : 'milliseconds'
    } else if (absMs < 60000) {
      value = Math.round(absMs / 1000)
      unit = value === 1 ? 'second' : 'seconds'
    } else if (absMs < 3600000) {
      value = Math.round(absMs / 60000)
      unit = value === 1 ? 'minute' : 'minutes'
    } else if (absMs < 86400000) {
      value = Math.round(absMs / 3600000)
      unit = value === 1 ? 'hour' : 'hours'
    } else {
      value = Math.round(absMs / 86400000)
      unit = value === 1 ? 'day' : 'days'
    }

    return isNegative ? `${value} ${unit} ago` : `in ${value} ${unit}`
  }
}
