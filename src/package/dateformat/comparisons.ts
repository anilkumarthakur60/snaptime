import type { Unit } from '../type'

/** Comparison methods */
export class Comparisons {
  static isBefore(value: number, other: number): boolean {
    return value < other
  }

  static isAfter(value: number, other: number): boolean {
    return value > other
  }

  static isSame(value: number, other: number): boolean {
    return value === other
  }

  static isSameOrBefore(
    value: number,
    other: number,
    unit?: Unit,
    startOfFn?: (v: number, u: Unit) => number
  ): boolean {
    if (unit && startOfFn) {
      return startOfFn(value, unit) <= startOfFn(other, unit)
    }
    return value <= other
  }

  static isSameOrAfter(
    value: number,
    other: number,
    unit?: Unit,
    startOfFn?: (v: number, u: Unit) => number
  ): boolean {
    if (unit && startOfFn) {
      return startOfFn(value, unit) >= startOfFn(other, unit)
    }
    return value >= other
  }

  static isBetween(
    value: number,
    a: number,
    b: number,
    unit?: Unit,
    inclusivity?: string,
    startOfFn?: (v: number, u: Unit) => number
  ): boolean {
    if (unit && startOfFn) {
      const ts = startOfFn(value, unit)
      const As = startOfFn(a, unit)
      const Bs = startOfFn(b, unit)

      const inc = inclusivity || '()'
      const leftOp =
        inc[0] === '[' ? (v: number, w: number) => v >= w : (v: number, w: number) => v > w
      const rightOp =
        inc[1] === ']' ? (v: number, w: number) => v <= w : (v: number, w: number) => v < w
      return leftOp(ts, As) && rightOp(ts, Bs)
    }

    const inc = inclusivity || '()'
    const leftOp =
      inc[0] === '[' ? (v: number, w: number) => v >= w : (v: number, w: number) => v > w
    const rightOp =
      inc[1] === ']' ? (v: number, w: number) => v <= w : (v: number, w: number) => v < w
    return leftOp(value, a) && rightOp(value, b)
  }
}
