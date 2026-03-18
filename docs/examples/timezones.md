# Working with Timezones Examples

Handle dates across different timezones safely and efficiently.

## Basic Timezone Operations

```typescript
import { DateFormat, Timezone } from '@anilkumarthakur/d8'

// Create a UTC date
const utcDate = new DateFormat('2024-01-15T12:00:00Z')
console.log(utcDate.isUtc()) // true

// Convert to different timezones
const newyork = new Timezone('America/New_York')
console.log(newyork.format(utcDate, 'HH:mm'))   // 07:00

const tokyo = new Timezone('Asia/Tokyo')
console.log(tokyo.format(utcDate, 'HH:mm'))     // 21:00

const london = new Timezone('Europe/London')
console.log(london.format(utcDate, 'HH:mm'))    // 12:00
```

## Offset Information

```typescript
import { DateFormat, Timezone } from '@anilkumarthakur/d8'

const date = new DateFormat('2024-01-15T12:00:00Z')

const tz = new Timezone('America/New_York')

// Get offset details
console.log(tz.offsetMinutes(date)) // -300 (UTC-5)
console.log(tz.offsetString(date))  // "-05:00"

// Check DST (Daylight Saving Time)
const summerDate = new DateFormat('2024-07-15T12:00:00Z')
console.log(tz.offsetMinutes(summerDate)) // -240 (UTC-4, DST)
console.log(tz.isDST(summerDate))         // true
```

## Meeting Scheduling

```typescript
import { DateFormat, Timezone } from '@anilkumarthakur/d8'

function scheduleMeeting(meetingTimeUTC, participants) {
  const meeting = new DateFormat(meetingTimeUTC)

  const results = {}
  for (const [name, timezone] of Object.entries(participants)) {
    const tz = new Timezone(timezone)
    results[name] = {
      timezone: timezone,
      localTime: tz.format(meeting, 'YYYY-MM-DD HH:mm'),
      offset: tz.offsetString(meeting)
    }
  }

  return results
}

const participants = {
  'Alice': 'America/New_York',
  'Bob': 'Europe/London',
  'Charlie': 'Asia/Tokyo',
  'Diana': 'Australia/Sydney'
}

const availableTimes = scheduleMeeting('2024-02-15T15:00:00Z', participants)

for (const [name, info] of Object.entries(availableTimes)) {
  console.log(`${name} (${info.timezone}): ${info.localTime} ${info.offset}`)
}
// Output:
// Alice (America/New_York): 2024-02-15 10:00 -05:00
// Bob (Europe/London): 2024-02-15 15:00 +00:00
// Charlie (Asia/Tokyo): 2024-02-16 00:00 +09:00
// Diana (Australia/Sydney): 2024-02-16 02:00 +11:00
```

## User Timezone Display

```typescript
import { DateFormat, Timezone } from '@anilkumarthakur/d8'

function formatForUser(utcDate, userTimezone) {
  const tz = new Timezone(userTimezone)

  try {
    const formatted = tz.format(utcDate, 'YYYY-MM-DD HH:mm')
    const offset = tz.offsetString(utcDate)

    return {
      formatted: formatted,
      timezone: userTimezone,
      offset: offset
    }
  } catch (error) {
    console.error(`Invalid timezone: ${userTimezone}`)
    // Fallback to UTC
    return {
      formatted: utcDate.format('YYYY-MM-DD HH:mm'),
      timezone: 'UTC',
      offset: '+00:00'
    }
  }
}

const serverTime = new DateFormat('2024-02-15T15:30:00Z')

console.log(formatForUser(serverTime, 'America/Los_Angeles'))
// { formatted: '2024-02-15 07:30', timezone: 'America/Los_Angeles', offset: '-08:00' }

console.log(formatForUser(serverTime, 'Asia/Kolkata'))
// { formatted: '2024-02-15 21:00', timezone: 'Asia/Kolkata', offset: '+05:30' }
```

## Server-Side Logging

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

function logEvent(eventName, userTimezone) {
  const timestamp = new DateFormat() // Current time

  // Always store UTC on server
  const utcTime = timestamp.isUtc() ? timestamp : timestamp.utc()

  // Log in UTC
  console.log(`[${utcTime.format('YYYY-MM-DD HH:mm:ss')} UTC] ${eventName}`)

  return {
    eventName: eventName,
    utcTime: utcTime.toISOString(),
    userTimestamp: userTimezone ?
      new Timezone(userTimezone).format(utcTime, 'YYYY-MM-DD HH:mm:ss') :
      null
  }
}

logEvent('User login', 'America/New_York')
logEvent('Payment processed', 'Europe/London')
```

## DST Transitions

```typescript
import { DateFormat, Timezone } from '@anilkumarthakur/d8'

function showDSTTransition(year, timezone) {
  const tz = new Timezone(timezone)

  // Check offset changes throughout year
  const months = []

  for (let month = 1; month <= 12; month++) {
    const date = new DateFormat(new Date(year, month - 1, 15, 12, 0, 0))
    months.push({
      month: date.format('MMMM'),
      offset: tz.offsetString(date),
      isDST: tz.isDST(date)
    })
  }

  return months
}

console.log('US Eastern Time (2024):')
const eastern = showDSTTransition(2024, 'America/New_York')
for (const month of eastern) {
  const dst = month.isDST ? 'EDT' : 'EST'
  console.log(`${month.month}: ${month.offset} (${dst})`)
}

// Output shows EDT (UTC-4) in summer, EST (UTC-5) in winter
```

## Time Series Data

```typescript
import { DateFormat, Timezone, DateCollection } from '@anilkumarthakur/d8'

function processTimeSeriesData(data, sourceTimezone, displayTimezone) {
  const sourceTs = new Timezone(sourceTimezone)
  const displayTs = new Timezone(displayTimezone)

  return data.map((item) => ({
    ...item,
    sourceTime: sourceTs.format(item.date, 'YYYY-MM-DD HH:mm'),
    displayTime: displayTs.format(item.date, 'YYYY-MM-DD HH:mm'),
    offsetDiff: displayTs.offsetString(item.date)
  }))
}

const data = [
  { date: new DateFormat('2024-01-15T10:00:00Z'), value: 100 },
  { date: new DateFormat('2024-01-15T11:00:00Z'), value: 105 },
  { date: new DateFormat('2024-01-15T12:00:00Z'), value: 110 }
]

const processed = processTimeSeriesData(data, 'UTC', 'America/Los_Angeles')

console.log(processed)
```

## API Interaction

```typescript
import { DateFormat, Timezone } from '@anilkumarthakur/d8'

// Send to API in UTC
function createEvent(eventData, userTimezone) {
  // Convert user's local time to UTC
  const tz = new Timezone(userTimezone)

  // Assuming user provided time needs to be converted
  // This is typically done on frontend, but shown here for clarity

  return {
    ...eventData,
    timestamp: new DateFormat().toISOString(),
    timezone: userTimezone
  }
}

// Receive from API and display in user's timezone
function displayEvent(apiEvent, userTimezone) {
  const eventTime = new DateFormat(apiEvent.timestamp)
  const tz = new Timezone(userTimezone)

  return {
    title: apiEvent.title,
    displayTime: tz.format(eventTime, 'YYYY-MM-DD HH:mm'),
    timezone: userTimezone,
    originalUTC: eventTime.format('YYYY-MM-DD HH:mm Z')
  }
}
```

## Best Practices

```typescript
import { DateFormat, Timezone } from '@anilkumarthakur/d8'

// ✅ DO: Always work with UTC on the server
const serverTime = new DateFormat() // Current UTC time
const utcIso = serverTime.toISOString()

// ✅ DO: Store UTC in the database
const databaseEntry = {
  timestamp: utcIso,
  // ...other data
}

// ✅ DO: Convert to user's timezone for display
const userTimezone = 'America/New_York' // From user preferences
const tz = new Timezone(userTimezone)
const displayTime = tz.format(serverTime, 'YYYY-MM-DD HH:mm')

// ❌ DON'T: Use local time on the server
// const localTime = new Date() // Browser local time

// ❌ DON'T: Store offset without timezone (offset changes with DST)
// const offset = -5 // Not enough information

// ❌ DON'T: Assume user's timezone
// Always get from user preferences or detect reliably
```

## Timezone Validation

```typescript
import { Timezone } from '@anilkumarthakur/d8'

function getValidTimezone(userInput, fallback = 'UTC') {
  if (Timezone.isValid(userInput)) {
    return new Timezone(userInput)
  } else {
    console.warn(`Invalid timezone "${userInput}", using ${fallback}`)
    return new Timezone(fallback)
  }
}

// Usage
const tz = getValidTimezone('Invalid/Timezone', 'America/New_York')
```
