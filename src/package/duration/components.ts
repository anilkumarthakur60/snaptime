/** Duration component extraction utilities */
export class DurationComponent {
  static milliseconds(ms: number): number {
    return Math.floor(Math.abs(ms) % 1000)
  }

  static seconds(ms: number): number {
    return Math.floor((Math.abs(ms) / 1000) % 60)
  }

  static minutes(ms: number): number {
    return Math.floor((Math.abs(ms) / 60000) % 60)
  }

  static hours(ms: number): number {
    return Math.floor((Math.abs(ms) / 3600000) % 24)
  }

  static days(ms: number): number {
    return Math.floor((Math.abs(ms) / 86400000) % 30)
  }

  static weeks(ms: number): number {
    return Math.floor((Math.abs(ms) / 604800000) % 4)
  }

  static months(ms: number): number {
    return Math.floor((Math.abs(ms) / 2592000000) % 12)
  }

  static years(ms: number): number {
    return Math.floor(Math.abs(ms) / 31536000000)
  }
}
