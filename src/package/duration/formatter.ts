/** Duration formatting utilities */
export class DurationFormatter {
  static humanize(ms: number, withSuffix: boolean = false): string {
    const absMsVal = Math.abs(ms)
    const isNegative = ms < 0

    if (absMsVal < 1000) {
      const val = Math.round(absMsVal)
      return withSuffix
        ? isNegative
          ? `${val} milliseconds ago`
          : `in ${val} milliseconds`
        : `${val}ms`
    }

    const s = absMsVal / 1000
    if (s < 60) {
      const val = Math.round(s)
      return withSuffix ? (isNegative ? `${val} seconds ago` : `in ${val} seconds`) : `${val}s`
    }

    const m = s / 60
    if (m < 60) {
      const val = Math.round(m)
      return withSuffix ? (isNegative ? `${val} minutes ago` : `in ${val} minutes`) : `${val}m`
    }

    const h = m / 60
    if (h < 24) {
      const val = Math.round(h)
      return withSuffix ? (isNegative ? `${val} hours ago` : `in ${val} hours`) : `${val}h`
    }

    const d = h / 24
    const val = Math.round(d)
    return withSuffix ? (isNegative ? `${val} days ago` : `in ${val} days`) : `${val}d`
  }

  static format(ms: number, fmt: string): string {
    const H = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    const S = Math.floor(ms % 1000)

    return fmt
      .replace(/HH/g, String(H).padStart(2, '0'))
      .replace(/H(?!H)/g, String(H))
      .replace(/mm/g, String(m).padStart(2, '0'))
      .replace(/m(?!m)/g, String(m))
      .replace(/ss/g, String(s).padStart(2, '0'))
      .replace(/s(?!s)/g, String(s))
      .replace(/SSS/g, String(S).padStart(3, '0'))
  }

  static toISO8601(ms: number): string {
    const years = Math.floor(ms / 31536000000)
    const months = Math.floor((ms % 31536000000) / 2592000000)
    const days = Math.floor((ms % 2592000000) / 86400000)
    const hours = Math.floor((ms % 86400000) / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const msVal = ms % 1000

    let result = 'P'
    if (years > 0) result += `${years}Y`
    if (months > 0) result += `${months}M`
    if (days > 0) result += `${days}D`

    if (hours > 0 || minutes > 0 || seconds > 0 || msVal > 0) {
      result += 'T'
      if (hours > 0) result += `${hours}H`
      if (minutes > 0) result += `${minutes}M`
      if (seconds > 0 || msVal > 0) {
        const totalSeconds = seconds + msVal / 1000
        result += `${totalSeconds}S`
      }
    }

    return result === 'P' ? 'PT0S' : result
  }
}
