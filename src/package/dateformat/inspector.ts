/** Date query methods */
export class DateInspector {
  static isValid(date: Date): boolean {
    return !isNaN(date.getTime())
  }

  static isDST(date: Date, year: number): boolean {
    const jan = new Date(year, 0, 1).getTimezoneOffset()
    const jul = new Date(year, 6, 1).getTimezoneOffset()
    return Math.min(jan, jul) === date.getTimezoneOffset()
  }

  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  static getWeekday(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[day] ?? 'Sunday'
  }

  static daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate()
  }

  static dayOfYear(date: Date, isUTC: boolean): number {
    const year = isUTC ? date.getUTCFullYear() : date.getFullYear()
    const start = isUTC ? new Date(Date.UTC(year, 0, 0)) : new Date(year, 0, 0)
    const diff = date.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
  }

  static isoWeek(date: Date, isUTC: boolean): number {
    const d = new Date(isUTC ? date.getTime() : new Date(date).getTime())
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 3 - (d.getDay() || 7))
    const yearStart = new Date(d.getFullYear(), 0, 1)
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
    if (week < 1) {
      return new DateInspector().isoWeekCalc(new Date(d.getFullYear() - 1, 11, 31), isUTC)
    }
    if (week > 52) {
      const nextYearStart = new Date(d.getFullYear() + 1, 0, 1)
      if (d.getTime() >= nextYearStart.getTime()) {
        return 1
      }
    }

    return week
  }

  private isoWeekCalc(date: Date, isUTC: boolean): number {
    const d = new Date(isUTC ? date.getTime() : new Date(date).getTime())
    d.setDate(d.getDate() + 3 - (d.getDay() || 7))
    const yearStart = new Date(d.getFullYear(), 0, 1)
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  }

  static isoWeekYear(date: Date, isUTC: boolean): number {
    const d = new Date(isUTC ? date.getTime() : new Date(date).getTime())
    d.setDate(d.getDate() + 3 - (d.getDay() || 7))
    return d.getFullYear()
  }

  static weeksInYear(year: number): number {
    const lastDay = new Date(year, 11, 31)
    return new DateInspector().isoWeekCalc(lastDay, false) === 1 ? 52 : 53
  }
}
