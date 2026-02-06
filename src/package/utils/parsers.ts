export function parseISO(dateString: string): Date {
  // Remove 'Z' if present
  const s = dateString.endsWith('Z') ? dateString.slice(0, -1) : dateString

  // Check if it's an ISO format and needs Z appended
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
  const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/

  if (ISO_DATETIME.test(s) || ISO_DATE.test(s)) {
    return new Date(s + 'Z')
  }

  return new Date(dateString)
}

export function parseUnixTimestamp(timestamp: number): Date {
  return new Date(timestamp)
}

export function parseDateLike(input: string | number | Date): { date: Date; isUTC: boolean } {
  let isUTC = false

  if (typeof input === 'number') {
    return { date: new Date(input), isUTC: false }
  }

  if (input instanceof Date) {
    return { date: new Date(input), isUTC: false }
  }

  // String input
  if (input.endsWith('Z')) {
    isUTC = true
    return { date: new Date(input), isUTC }
  }

  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
  const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/

  if (ISO_DATETIME.test(input) || ISO_DATE.test(input)) {
    isUTC = true
    return { date: new Date(input + 'Z'), isUTC }
  }

  if (/[zZ]$/.test(input) || /[+-]\d\d:?\d\d$/.test(input)) {
    isUTC = true
  }

  return { date: new Date(input), isUTC }
}
