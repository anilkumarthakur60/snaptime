# Natural Language

`NaturalLanguage` converts dates to human-readable, natural language descriptions.

## Constructor and Conversion

```typescript
import { NaturalLanguage, DateFormat } from '@anilkumarthakur/d8'

const date = new DateFormat('2024-01-15T14:30:00Z')
const nl = new NaturalLanguage(date)

// Convert to natural language
console.log(nl.format()) // "January 15, 2024 at 14:30"
```

## Relative Dates

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

const pastDate = new DateFormat().subtract(5, 'day')
const futureDate = new DateFormat().add(3, 'day')

// Relative to now
console.log(pastDate.fromNow())   // "5 days ago"
console.log(futureDate.toNow())   // "in 3 days"

// Relative to specific date
const from = new DateFormat().subtract(2, 'day')
console.log(pastDate.from(from))  // "3 days ago"
```

## Format Styles

```typescript
const date = new DateFormat('2024-01-15T14:30:00Z')

// Long format
console.log(date.humanize())
// "Monday, January 15, 2024 at 2:30 PM"

// Short format
console.log(date.format('MMM D, YY h:mm A'))
// "Jan 15, 24 2:30 PM"
```

## Time Descriptions

```typescript
// Exact time
const date1 = new DateFormat('2024-01-15T14:30:00Z')
console.log(date1.humanize()) // "Monday, January 15, 2024 at 2:30 PM"

// Approximate time
const date2 = new DateFormat('2024-01-15T14:23:00Z')
console.log(date2.humanize()) // "Monday, January 15, 2024 at 2:23 PM"
```

## Relative Time Descriptions

```typescript
const now = new DateFormat()

// Very recent
const just = now.subtract(30, 'second')
console.log(just.fromNow()) // "just now"

// Minutes ago
const minAgo = now.subtract(5, 'minute')
console.log(minAgo.fromNow()) // "5 minutes ago"

// Hours ago
const hrAgo = now.subtract(2, 'hour')
console.log(hrAgo.fromNow()) // "2 hours ago"

// Yesterday
const yesterday = now.subtract(1, 'day')
console.log(yesterday.fromNow()) // "a day ago"

// Days ago
const daysAgo = now.subtract(5, 'day')
console.log(daysAgo.fromNow()) // "5 days ago"

// Weeks ago
const weeksAgo = now.subtract(2, 'week')
console.log(weeksAgo.fromNow()) // "2 weeks ago"

// Months ago
const monthsAgo = now.subtract(3, 'month')
console.log(monthsAgo.fromNow()) // "3 months ago"

// Years ago
const yearsAgo = now.subtract(1, 'year')
console.log(yearsAgo.toNow()) // "in a year"
```

## Future Time

```typescript
const now = new DateFormat()

// Soon
const soon = now.add(30, 'second')
console.log(soon.toNow()) // "in 30 seconds"

// Later today
const later = now.add(3, 'hour')
console.log(later.toNow()) // "in 3 hours"

// Tomorrow
const tomorrow = now.add(1, 'day')
console.log(tomorrow.toNow()) // "in a day"

// Next week
const nextWeek = now.add(1, 'week')
console.log(nextWeek.toNow()) // "in a week"

// Next month
const nextMonth = now.add(1, 'month')
console.log(nextMonth.toNow()) // "in a month"
```

## Relative Between Dates

```typescript
const date1 = new DateFormat('2024-01-10')
const date2 = new DateFormat('2024-01-15')

// date1 relative to date2
console.log(date1.from(date2)) // "5 days ago"
console.log(date1.to(date2))   // "5 days later"
```

## Common Patterns

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

// Activity timestamp
const lastUpdate = new DateFormat().subtract(3, 'hour')
console.log(`Last updated ${lastUpdate.fromNow()}`)
// Output: "Last updated 3 hours ago"

// Event countdown
const eventDate = new DateFormat('2024-02-14')
console.log(`Event in ${eventDate.toNow()}`)
// Output: "Event in 24 days" (if today is Jan 21)

// Post/article date
const postDate = new DateFormat('2024-01-15')
console.log(postDate.humanize())
// Output: "Monday, January 15, 2024 at 12:00 PM"

// Meeting reminder
const meeting = new DateFormat('2024-02-15T14:30:00')
const timeUntil = meeting.toNow()
console.log(`Meeting ${timeUntil}`)
// Output: "Meeting in 31 days"

// Age calculation
const birthdate = new DateFormat('1990-05-15')
console.log(`Born ${birthdate.fromNow()}`)
// Output: "Born 34 years ago"

// Expiry warning
const expiryDate = new DateFormat('2024-02-01')
const daysLeft = expiryDate.diff(new DateFormat(), 'day')
console.log(`Expires in ${daysLeft} days`)
```

## Localization

D8 supports relative time descriptions in English. For other languages, use custom formatting:

```typescript
const date = new DateFormat('2024-01-15')

// Custom French translation (example)
const translations = {
  'daysAgo': 'il y a {number} jours',
  'inDays': 'dans {number} jours'
}

// Use format() with custom formatting
const formatted = date.format('D MMMM YYYY')
```

## Advanced Examples

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

// Timeline generation
function generateTimeline(dates: DateFormat[]) {
  const now = new DateFormat()
  return dates.map(date => ({
    date: date.format('YYYY-MM-DD'),
    relative: date.from(now),
    human: date.humanize()
  }))
}

// Expiry checker
function checkExpiry(expiryDate: DateFormat) {
  const daysLeft = expiryDate.diff(new DateFormat(), 'day')

  if (daysLeft < 0) {
    return 'Expired!'
  } else if (daysLeft === 0) {
    return 'Expires today'
  } else if (daysLeft < 7) {
    return `Expires ${expiryDate.toNow()}`
  } else {
    return `Expires ${expiryDate.format('MMM D, YYYY')}`
  }
}

// Time since event
function timeSince(eventDate: DateFormat) {
  const now = new DateFormat()
  const diff = now.diff(eventDate, 'second')

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`

  return eventDate.format('MMM D, YYYY')
}
```
