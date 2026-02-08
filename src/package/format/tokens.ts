export class FormatTokens {
  static readonly FORMAT_TOKENS: Record<string, (d: Date, isUTC: boolean) => string> = {
    YYYY: (d, u) => {
      const y = u ? d.getUTCFullYear() : d.getFullYear()
      return String(y)
    },
    YY: (d, u) => {
      const y = u ? d.getUTCFullYear() : d.getFullYear()
      return String(y).slice(-2)
    },
    Y: (d, u) => {
      const y = u ? d.getUTCFullYear() : d.getFullYear()
      return String(y)
    },
    MMMM: (d, u) => {
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]
      const m = u ? d.getUTCMonth() : d.getMonth()
      return months[m] ?? 'January'
    },
    MMM: (d, u) => {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ]
      const m = u ? d.getUTCMonth() : d.getMonth()
      return months[m] ?? 'Jan'
    },
    MM: (d, u) => {
      const m = u ? d.getUTCMonth() : d.getMonth()
      return String(m + 1).padStart(2, '0')
    },
    M: (d, u) => {
      const m = u ? d.getUTCMonth() : d.getMonth()
      return String(m + 1)
    },
    Qo: (d, u) => {
      const m = u ? d.getUTCMonth() : d.getMonth()
      const q = Math.floor(m / 3) + 1
      const suffix = ['st', 'nd', 'rd', 'th'][q - 1]
      return `${q}${suffix ?? 'th'}`
    },
    Q: (d, u) => {
      const m = u ? d.getUTCMonth() : d.getMonth()
      return String(Math.floor(m / 3) + 1)
    },
    DDDD: (d, u) => {
      const day = u ? d.getUTCDate() : d.getDate()
      return String(day).padStart(3, '0')
    },
    DDD: (d, u) => {
      const start = u
        ? new Date(Date.UTC(d.getUTCFullYear(), 0, 0))
        : new Date(d.getFullYear(), 0, 0)
      const diff = d.getTime() - start.getTime()
      const oneDay = 1000 * 60 * 60 * 24
      return String(Math.floor(diff / oneDay))
    },
    DD: (d, u) => {
      const day = u ? d.getUTCDate() : d.getDate()
      return String(day).padStart(2, '0')
    },
    D: (d, u) => {
      const day = u ? d.getUTCDate() : d.getDate()
      return String(day)
    },
    dddd: (d, u) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const day = u ? d.getUTCDay() : d.getDay()
      return days[day] ?? 'Sunday'
    },
    ddd: (d, u) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const day = u ? d.getUTCDay() : d.getDay()
      return days[day] ?? 'Sun'
    },
    dd: (d, u) => {
      const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
      const day = u ? d.getUTCDay() : d.getDay()
      return days[day] ?? 'Su'
    },
    do: (d, u) => {
      const day = u ? d.getUTCDate() : d.getDate()
      const suffix = ['st', 'nd', 'rd', 'th'][(day - 1) % 10]
      return `${day}${suffix ?? 'th'}`
    },
    E: (d, u) => {
      const day = u ? d.getUTCDay() : d.getDay()
      return String(((day || 7) % 7) + 1)
    },
    e: (d, u) => {
      const day = u ? d.getUTCDay() : d.getDay()
      return String((day || 7) % 7)
    },
    HH: (d, u) => {
      const h = u ? d.getUTCHours() : d.getHours()
      return String(h).padStart(2, '0')
    },
    H: (d, u) => {
      const h = u ? d.getUTCHours() : d.getHours()
      return String(h)
    },
    hh: (d, u) => {
      const h = u ? d.getUTCHours() : d.getHours()
      const h12 = h % 12 || 12
      return String(h12).padStart(2, '0')
    },
    h: (d, u) => {
      const h = u ? d.getUTCHours() : d.getHours()
      return String(h % 12 || 12)
    },
    kk: (d, u) => {
      const h = u ? d.getUTCHours() : d.getHours()
      return String(h || 24).padStart(2, '0')
    },
    k: (d, u) => {
      const h = u ? d.getUTCHours() : d.getHours()
      return String(h || 24)
    },
    a: (d, u) => {
      const h = u ? d.getUTCHours() : d.getHours()
      return h < 12 ? 'am' : 'pm'
    },
    A: (d, u) => {
      const h = u ? d.getUTCHours() : d.getHours()
      return h < 12 ? 'AM' : 'PM'
    },
    mm: (d, u) => {
      const m = u ? d.getUTCMinutes() : d.getMinutes()
      return String(m).padStart(2, '0')
    },
    m: (d, u) => {
      const m = u ? d.getUTCMinutes() : d.getMinutes()
      return String(m)
    },
    ss: (d, u) => {
      const s = u ? d.getUTCSeconds() : d.getSeconds()
      return String(s).padStart(2, '0')
    },
    s: (d, u) => {
      const s = u ? d.getUTCSeconds() : d.getSeconds()
      return String(s)
    },
    SSS: (d, u) => {
      const ms = u ? d.getUTCMilliseconds() : d.getMilliseconds()
      return String(ms).padStart(3, '0')
    },
    SS: (d, u) => {
      const ms = u ? d.getUTCMilliseconds() : d.getMilliseconds()
      return String(Math.floor(ms / 10)).padStart(2, '0')
    },
    S: (d) => {
      const ms = d.getMilliseconds()
      return String(Math.floor(ms / 100))
    },
    Z: (d) => {
      const off = -d.getTimezoneOffset()
      const sign = off >= 0 ? '+' : '-'
      const absOff = Math.abs(off)
      const h = Math.floor(absOff / 60)
      const m = absOff % 60
      return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    },
    ZZ: (d) => {
      const off = -d.getTimezoneOffset()
      const sign = off >= 0 ? '+' : '-'
      const absOff = Math.abs(off)
      const h = Math.floor(absOff / 60)
      const m = absOff % 60
      return `${sign}${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}`
    },
    X: (d) => Math.floor(d.getTime() / 1000).toString(),
    x: (d) => d.getTime().toString(),
    GGGG: (d, u) => {
      const jan4 = u
        ? new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
        : new Date(d.getFullYear(), 0, 4)
      const weekStart = new Date(jan4)
      const day = weekStart.getDay()
      weekStart.setDate(jan4.getDate() - day)
      const thisYear = weekStart < jan4 ? d.getFullYear() : d.getFullYear() - 1
      return String(thisYear)
    },
    GG: (d, u) => {
      const jan4 = u
        ? new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
        : new Date(d.getFullYear(), 0, 4)
      const weekStart = new Date(jan4)
      const day = weekStart.getDay()
      weekStart.setDate(jan4.getDate() - day)
      const thisYear = weekStart < jan4 ? d.getFullYear() : d.getFullYear() - 1
      return String(thisYear).slice(-2)
    },
    Wo: (d, u) => {
      const jan4 = u
        ? new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
        : new Date(d.getFullYear(), 0, 4)
      const weekStart = new Date(jan4)
      const day = weekStart.getDay()
      weekStart.setDate(jan4.getDate() - day)
      const diff = d.getTime() - weekStart.getTime()
      const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
      const suffix = ['st', 'nd', 'rd', 'th'][week % 10]
      return `${week}${suffix ?? 'th'}`
    },
    W: (d, u) => {
      const jan4 = u
        ? new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
        : new Date(d.getFullYear(), 0, 4)
      const weekStart = new Date(jan4)
      const day = weekStart.getDay()
      weekStart.setDate(jan4.getDate() - day)
      const diff = d.getTime() - weekStart.getTime()
      const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
      return String(week)
    }
  }
}
