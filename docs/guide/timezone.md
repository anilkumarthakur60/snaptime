# Timezone

`Timezone` provides comprehensive timezone support using IANA timezone identifiers with automatic DST handling.

## Constructor

```typescript
import { Timezone } from '@anilkumarthakur/d8'

// Create with IANA identifier
const utc = new Timezone('UTC')
const newyork = new Timezone('America/New_York')
const tokyo = new Timezone('Asia/Tokyo')
const kolkata = new Timezone('Asia/Kolkata')

// Validate timezone
if (Timezone.isValid('America/New_York')) {
  console.log('Valid timezone')
} else {
  console.log('Invalid timezone')
}

// Get system timezone
const local = new Timezone(Timezone.guess())
```

## IANA Database

D8 uses the standard IANA timezone database. Some common timezones:

### Americas

- `America/New_York` (EST/EDT)
- `America/Chicago` (CST/CDT)
- `America/Denver` (MST/MDT)
- `America/Los_Angeles` (PST/PDT)
- `America/Toronto` (EST/EDT)
- `America/Mexico_City` (CST/CDT)
- `America/Sao_Paulo` (BRT)
- `America/Buenos_Aires` (ART)

### Europe

- `Europe/London` (GMT/BST)
- `Europe/Paris` (CET/CEST)
- `Europe/Berlin` (CET/CEST)
- `Europe/Moscow` (MSK)

### Asia

- `Asia/Tokyo` (JST)
- `Asia/Shanghai` (CST)
- `Asia/Hong_Kong` (HKT)
- `Asia/Singapore` (SGT)
- `Asia/Kolkata` (IST)
- `Asia/Dubai` (GST)
- `Asia/Bangkok` (ICT)

### Oceania

- `Australia/Sydney` (AEDT/AEST)
- `Australia/Melbourne` (AEDT/AEST)
- `Pacific/Auckland` (NZDT/NZST)

[Full IANA Timezone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## Offset Information

```typescript
import { DateFormat, Timezone } from '@anilkumarthakur/d8'

const date = new DateFormat('2024-01-15T12:00:00Z')
const tz = new Timezone('America/New_York')

// Get offset in minutes
console.log(tz.offsetMinutes(date)) // -300 (UTC-5, January)

// Get offset as ±HH:MM format
console.log(tz.offsetString(date)) // "-05:00"

// Check DST
console.log(tz.isDST(date)) // false (winter)

const julyDate = new DateFormat('2024-07-15T12:00:00Z')
console.log(tz.offsetMinutes(julyDate)) // -240 (UTC-4, July)
console.log(tz.isDST(julyDate)) // true (summer)
```

## Formatting in Timezone

```typescript
import { DateFormat, Timezone } from '@anilkumarthakur/d8'

const utcDate = new DateFormat('2024-01-15T14:30:00Z')

// Format in different timezones
const newyork = new Timezone('America/New_York')
console.log(newyork.format(utcDate, 'YYYY-MM-DD HH:mm'))
// 2024-01-15 09:30

const tokyo = new Timezone('Asia/Tokyo')
console.log(tokyo.format(utcDate, 'YYYY-MM-DD HH:mm'))
// 2024-01-15 23:30

const kolkata = new Timezone('Asia/Kolkata')
console.log(kolkata.format(utcDate, 'YYYY-MM-DD HH:mm'))
// 2024-01-15 20:00
```

## Local Date Conversion

```typescript
const timezone = new Timezone('America/Los_Angeles')
const utcDate = new DateFormat('2024-01-15T20:00:00Z')

// Get the local wall-clock time in UTC mode
// Useful for storing timezone-aware dates
const localDate = timezone.toLocalDate(utcDate)

// This represents: 2024-01-15T12:00:00 (PST is UTC-8)
console.log(localDate.format('YYYY-MM-DD HH:mm:ss'))
// Output depends on timezone conversion
```

## Quick Convert Function

```typescript
const utcDate = new DateFormat('2024-01-15T14:30:00Z')

// Quick timezone conversion using chained methods
const nyTime = utcDate.tz('America/New_York')
console.log(nyTime.format('HH:mm')) // 09:30

const tokyoTime = utcDate.tz('Asia/Tokyo')
console.log(tokyoTime.format('HH:mm')) // 23:30
```

## Common Patterns

```typescript
import { DateFormat, Timezone } from '@anilkumarthakur/d8'

// Meeting scheduling across timezones
const meetingUTC = new DateFormat('2024-02-15T15:00:00Z')

const timezones = [
  'America/New_York',
  'Europe/London',
  'Asia/Kolkata'
]

for (const tz of timezones) {
  const timezone = new Timezone(tz)
  console.log(
    `${tz}: ${timezone.format(meetingUTC, 'HH:mm')}`
  )
}

// Server-side time tracking (always use UTC)
const eventTime = new DateFormat(new Date()) // Use UTC
const evenStorageTime = eventTime.isUtc() ? eventTime : eventTime.utc()

// User-local time display
const timezone = new Timezone(userTimezone)
const displayTime = timezone.format(utcTime, 'YYYY-MM-DD HH:mm:ss')

// DST awareness
const tz = new Timezone('America/New_York')
const wintertTime = new DateFormat('2024-01-15')
const summerTime = new DateFormat('2024-07-15')

console.log(tz.offsetString(wintertTime)) // -05:00
console.log(tz.offsetString(summerTime)) // -04:00

// Calculate meeting time in local timezone
const baseTime = new DateFormat('2024-02-15T09:00:00Z')
const userTz = new Timezone(getUserTimezone())
const userTime = userTz.toLocalDate(baseTime)
console.log(userTime.format('YYYY-MM-DD HH:mm'))
```

## Best Practices

1. **Store in UTC**: Always store dates in UTC on the server
2. **Convert on Display**: Convert to user's timezone only when displaying
3. **Use IANA Identifiers**: Always use official IANA timezone names
4. **Handle DST**: Remember that offsets change during DST transitions
5. **Validate Input**: Check timezone validity before creating Timezone objects

## Error Handling

```typescript
// Invalid timezone throws on construction
try {
  const tz = new Timezone('Invalid/Timezone')
} catch (error) {
  console.log('Invalid IANA timezone:', error.message)
}

// Validate before use
if (Timezone.isValid(userInput)) {
  const tz = new Timezone(userInput)
} else {
  console.log('Please select a valid timezone')
}
```
