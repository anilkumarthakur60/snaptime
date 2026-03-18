# Date Formatting Examples

Learn various ways to format dates using D8.

## Basic Formatting

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

const date = new DateFormat('2024-01-15T14:30:45.123Z')

// ISO format
console.log(date.format('YYYY-MM-DD')) // 2024-01-15

// US format
console.log(date.format('MM/DD/YYYY')) // 01/15/2024

// European format
console.log(date.format('DD/MM/YYYY')) // 15/01/2024

// Medical format
console.log(date.format('YYYY-MM-DD HH:mm:ss')) // 2024-01-15 14:30:45

// Time only
console.log(date.format('HH:mm:ss')) // 14:30:45
console.log(date.format('h:mm A')) // 2:30 PM
console.log(date.format('hh:mm a')) // 02:30 pm

// Complete time
console.log(date.format('HH:mm:ss.SSS')) // 14:30:45.123
```

## Day and Month Names

```typescript
const date = new DateFormat('2024-01-15')

// Full names
console.log(date.format('dddd, MMMM D, YYYY'))
// "Monday, January 15, 2024"

// Short names
console.log(date.format('ddd, MMM D, YY'))
// "Mon, Jan 15, 24"

// Just day name
console.log(date.format('dddd')) // "Monday"

// Just month name
console.log(date.format('MMMM')) // "January"
```

## Ordinal Dates

```typescript
const dates = [
  new DateFormat('2024-01-01'),
  new DateFormat('2024-01-02'),
  new DateFormat('2024-01-03'),
  new DateFormat('2024-01-21'),
  new DateFormat('2024-01-22'),
  new DateFormat('2024-01-23')
]

// Create ordinal format (note: D uses ordinal suffix)
for (const d of dates) {
  console.log(d.format('MMMM D, YYYY'))
}
// Output:
// "January 1st, 2024"
// "January 2nd, 2024"
// "January 3rd, 2024"
// "January 21st, 2024"
// "January 22nd, 2024"
// "January 23rd, 2024"
```

## Local vs UTC Formatting

```typescript
// UTC date
const utcDate = new DateFormat('2024-01-15T20:30:00Z')
console.log(utcDate.isUtc()) // true
console.log(utcDate.format('HH:mm')) // 20:30

// Local date (interpretation depends on system timezone)
const localDate = new DateFormat(new Date(2024, 0, 15, 20, 30, 0))
console.log(localDate.isLocal()) // true
console.log(localDate.format('HH:mm')) // 20:30 (local time)
```

## Timezone-Aware Formatting

```typescript
import { Timezone } from '@anilkumarthakur/d8'

const date = new DateFormat('2024-01-15T12:00:00Z') // Noon UTC

// Format in different timezones
const newYork = new Timezone('America/New_York')
console.log(newYork.format(date, 'HH:mm'))
// "07:00" (UTC-5)

const tokyo = new Timezone('Asia/Tokyo')
console.log(tokyo.format(date, 'HH:mm'))
// "21:00" (UTC+9)

// With timezone offset
console.log(date.tz('America/New_York').format('HH:mm Z'))
// "07:00 -05:00"
```

## Dynamic Formatting

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

// Format based on how recent
function formatDate(date) {
  const now = new DateFormat()
  const diff = now.diff(date, 'day')

  if (diff === 0) {
    return date.format('h:mm A') // "2:30 PM"
  } else if (diff === 1) {
    return "Yesterday"
  } else if (diff < 7) {
    return date.format('dddd') // "Monday"
  } else if (diff < 30) {
    return date.format('MMM D') // "Jan 15"
  } else {
    return date.format('MMM D, YYYY') // "Jan 15, 2024"
  }
}

console.log(formatDate(new DateFormat())) // Today's time
console.log(formatDate(new DateFormat().subtract(1, 'day'))) // "Yesterday"
console.log(formatDate(new DateFormat().subtract(3, 'day'))) // Day name
console.log(formatDate(new DateFormat().subtract(1, 'month'))) // "Dec 15"
```

## Parsing Custom Formats

```typescript
// Parse various formats
const formats = [
  { input: '15/01/2024', format: 'DD/MM/YYYY' },
  { input: '01-15-24', format: 'MM-DD-YY' },
  { input: 'January 15, 2024', format: 'MMMM D, YYYY' },
  { input: '15 Jan 2024 2:30 PM', format: 'D MMM YYYY h:mm A' }
]

for (const { input, format } of formats) {
  const date = DateFormat.parse(input, format)
  if (date.isValid()) {
    console.log(`✓ ${input} → ${date.format('YYYY-MM-DD HH:mm')}`)
  }
}
```

## Display Formats

```typescript
const date = new DateFormat('2024-01-15T14:30:00Z')

// Log-friendly
console.log(`[${date.format('YYYY-MM-DD HH:mm:ss')}]`, 'Event occurred')

// API response
console.log({
  timestamp: date.toISOString(),
  formatted: date.format('YYYY-MM-DD HH:mm:ss Z')
})

// Report
console.log(`Report for ${date.format('MMMM YYYY')}`)

// Email
console.log(`Date: ${date.format('dddd, MMMM D, YYYY at h:mm A')}`)

// Filename
console.log(`backup_${date.format('YYYY-MM-DD_HH-mm-ss')}.zip`)
```
