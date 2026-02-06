import type { Unit } from '../type'
import { UNIT_MS } from '../utils/constants'

/** Date manipulation (get/set/add/subtract) */
export class DateMutator {
  static get(date: Date, isUTC: boolean, unit: Unit | 'day'): number {
    const p = isUTC ? 'getUTC' : 'get'
    let method = ''

    switch (unit) {
      case 'year':
        method = `${p}FullYear`
        break
      case 'month':
        method = `${p}Month`
        break
      case 'date':
        method = `${p}Date`
        break
      case 'day':
        method = `${p}Day`
        break
      case 'hour':
        method = `${p}Hours`
        break
      case 'minute':
        method = `${p}Minutes`
        break
      case 'second':
        method = `${p}Seconds`
        break
      case 'millisecond':
        method = `${p}Milliseconds`
        break
      default:
        throw new Error(`Unknown unit "${unit}"`)
    }

    type DateGetter = keyof Pick<
      Date,
      | 'getFullYear'
      | 'getMonth'
      | 'getDate'
      | 'getDay'
      | 'getHours'
      | 'getMinutes'
      | 'getSeconds'
      | 'getMilliseconds'
      | 'getUTCFullYear'
      | 'getUTCMonth'
      | 'getUTCDate'
      | 'getUTCDay'
      | 'getUTCHours'
      | 'getUTCMinutes'
      | 'getUTCSeconds'
      | 'getUTCMilliseconds'
    >
    const fn = date[method as DateGetter]
    const val = fn.call(date)
    return unit === 'month' ? val + 1 : val
  }

  static set(date: Date, isUTC: boolean, unit: Unit, val: number): Date {
    const p = isUTC ? 'setUTC' : 'set'
    let method = ''

    switch (unit) {
      case 'year':
        method = `${p}FullYear`
        break
      case 'month':
        method = `${p}Month`
        break
      case 'date':
        method = `${p}Date`
        break
      case 'hour':
        method = `${p}Hours`
        break
      case 'minute':
        method = `${p}Minutes`
        break
      case 'second':
        method = `${p}Seconds`
        break
      case 'millisecond':
        method = `${p}Milliseconds`
        break
      default:
        throw new Error(`Unknown unit "${unit}"`)
    }

    type DateSetter = keyof Pick<
      Date,
      | 'setFullYear'
      | 'setMonth'
      | 'setDate'
      | 'setHours'
      | 'setMinutes'
      | 'setSeconds'
      | 'setMilliseconds'
      | 'setUTCFullYear'
      | 'setUTCMonth'
      | 'setUTCDate'
      | 'setUTCHours'
      | 'setUTCMinutes'
      | 'setUTCSeconds'
      | 'setUTCMilliseconds'
    >
    const fn = date[method as DateSetter]
    fn.call(date, unit === 'month' ? val - 1 : val)
    return date
  }

  static addMs(ms: number, n: number, unit: Unit, isMonthOrYear: boolean): number {
    if (isMonthOrYear) {
      throw new Error('Use set() for month/year additions')
    }

    const unitMs = UNIT_MS[unit]
    if (isNaN(unitMs)) {
      throw new Error(`Unknown unit "${unit}"`)
    }

    return ms + n * unitMs
  }

  static diff(value: number, other: number, unit: Unit = 'millisecond', floating = false): number {
    const ms = value - other
    const per = UNIT_MS[unit] || 1

    if (per === 0) {
      throw new Error(`Invalid unit "${unit}"`)
    }

    const result = ms / per
    if (floating) {
      return Math.round((result + Number.EPSILON) * 100) / 100
    }
    return Math[result < 0 ? 'ceil' : 'floor'](result)
  }
}
