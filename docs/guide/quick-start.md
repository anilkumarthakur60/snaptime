# Quick Start

Let's explore D8 by building a real-world schedule display.

## 1. Create Dates

```typescript
import d8, { DateFormat } from '@anilkumarthakur/d8'

// Factory function (shortest)
const a = d8('2026-03-18')
const b = d8()                    // now
const c = d8(1774022400000)       // from timestamp
const d = d8(new Date())          // from native Date

// Class constructor (equivalent)
const e = new DateFormat('2026-03-18')
const f = new DateFormat('2026-03-18T09:30:00Z')

// UTC mode
const g = new DateFormat('2026-03-18', { utc: true })
```

## 2. Format Dates

```typescript
const date = d8('2026-03-18T14:30:45Z')

date.format('YYYY-MM-DD')              // "2026-03-18"
date.format('dddd, MMMM Do YYYY')      // "Wednesday, March 18th 2026"
date.format('hh:mm A')                 // "02:30 PM"
date.format('Do MMM YY')               // "18th Mar 26"
date.format('YYYY [Q]Q')               // "2026 Q1"
date.format('YYYY-[W]WW')              // "2026-W12"

// Intl formatting
date.formatIntl({ weekday: 'long', month: 'long', day: 'numeric' })
// "Wednesday, March 18"

// Serialization
date.toISOString()                      // "2026-03-18T14:30:45.000Z"
date.toSQL()                            // "2026-03-18 14:30:45"
date.toRFC2822()                        // "Wed, 18 Mar 2026 14:30:45 +0000"
date.toRFC3339()                        // "2026-03-18T14:30:45Z"
date.toExcel()                          // 46093.604...
date.toObject()
// { year: 2026, month: 3, date: 18, hour: 14, minute: 30, second: 45, millisecond: 0 }
```

## 3. Arithmetic

```typescript
const date = d8('2026-03-18')

// Add
date.add(7, 'day').format('YYYY-MM-DD')       // "2026-03-25"
date.add(1, 'month').format('YYYY-MM-DD')      // "2026-04-18"
date.add(2, 'week').format('YYYY-MM-DD')       // "2026-04-01"
date.add(1, 'fortnight').format('YYYY-MM-DD')  // "2026-04-01"

// Subtract
date.subtract(1, 'year').format('YYYY-MM-DD')  // "2025-03-18"

// Chain operations
date.add(1, 'month').subtract(3, 'day').add(2, 'hour')

// Start / end of period
date.startOf('month').format('YYYY-MM-DD')     // "2026-03-01"
date.endOf('year').format('YYYY-MM-DD')        // "2026-12-31"
date.startOf('week').format('YYYY-MM-DD')      // "2026-03-15" (Sunday)
date.startOf('quarter').format('YYYY-MM-DD')   // "2026-01-01"
```

## 4. Compare & Query

```typescript
const jan = d8('2026-01-15')
const mar = d8('2026-03-18')

jan.isBefore(mar)                // true
mar.isAfter(jan)                 // true
jan.isSame(d8('2026-01-15'))     // true
jan.isBetween('2026-01-01', '2026-02-01') // true

// Difference
mar.diff(jan, 'day')             // 62
mar.diff(jan, 'month')           // 2
mar.diff(jan, 'day', true)       // 62.0 (floating point)

// Day-of-week checks
mar.isWeekday()                  // true
mar.isWeekend()                  // false
mar.isSunday()                   // false
mar.isWednesday()                // true

// Period checks
mar.isCurrentYear()              // true (if year is 2026)
mar.isCurrentMonth()             // true (if month is March)
mar.isCurrentWeek()              // depends on current week
mar.isLeapYear()                 // false
mar.daysInMonth()                // 31

// Decade / century / millennium
mar.isCurrentDecade()            // true
mar.isCurrentCentury()           // true
```

## 5. Relative Time & Age

```typescript
const birthday = d8('1990-06-15')

birthday.fromNow()               // "13089 days ago"
birthday.age()                   // { years: 35, months: 9, days: 3 }
birthday.age().toString()        // "35y 9mo 3d"

// Precise diff
const diff = d8('2026-12-25').preciseDiff(d8('2026-03-18'))
diff.humanize()                  // "9 months, 7 days"
diff.months                      // 9
diff.days                        // 7

// Countdown
d8('2027-01-01').countdown().humanize()
// "288 days, 15 hours"
d8('2027-01-01').countdown().format('DD days HH:mm:ss')
// "288 days 15:30:00"
```

## 6. Durations

```typescript
import { Duration } from '@anilkumarthakur/d8'

// Create
const dur = Duration.parse('2h30m15s')

dur.toHours()                    // 2.504...
dur.toMinutes()                  // 150.25
dur.humanize()                   // "3h"  (short form)
dur.humanize(false)              // "2 hours, 30 minutes, 15 seconds"
dur.format('HH:mm:ss')          // "02:30:15"

// Arithmetic
dur.add(1, 'hour').toHours()     // 3.504...
dur.subtract(30, 'minute').toMinutes() // 120.25
```

## 7. Timezones

```typescript
import { Timezone } from '@anilkumarthakur/d8'

const date = d8('2026-03-18T12:00:00Z')
const ny = new Timezone('America/New_York')
const tokyo = new Timezone('Asia/Tokyo')

ny.format(date, 'HH:mm Z')      // "07:00 -05:00"
tokyo.format(date, 'HH:mm Z')   // "21:00 +09:00"

ny.offsetString(date)            // "-05:00"
ny.isDST(date)                   // true (March = DST)

Timezone.guess()                 // e.g. "Asia/Kathmandu"
Timezone.isValid('Europe/Paris') // true
```

## 8. Cron

```typescript
import { Cron } from '@anilkumarthakur/d8'

const job = new Cron('30 9 * * 1-5')

job.humanize()                   // "At 09:30, Monday through Friday"
job.matches(d8('2026-03-18').set('hour', 9).set('minute', 30))  // true

const next = job.next()
console.log(next.format('YYYY-MM-DD HH:mm'))

const matches = job.between(d8('2026-03-18'), d8('2026-03-20'))
console.log(matches.length)
```

## 9. Natural Language

```typescript
import d8 from '@anilkumarthakur/d8'

d8.natural('tomorrow').format('YYYY-MM-DD')
d8.natural('next friday').format('YYYY-MM-DD')
d8.natural('in 3 days').format('YYYY-MM-DD')
d8.natural('2 weeks ago').format('YYYY-MM-DD')
d8.natural('end of month').format('YYYY-MM-DD')
d8.natural('beginning of year').format('YYYY-MM-DD')
d8.natural('last day of March').format('YYYY-MM-DD')
d8.natural('3rd Monday of January 2027').format('YYYY-MM-DD')
```

## 10. Business Days

```typescript
import d8 from '@anilkumarthakur/d8'

const friday = d8('2026-03-20') // Friday

d8.business.isBusinessDay(friday)               // true
d8.business.nextBusinessDay(friday)             // Monday 2026-03-23
d8.business.addBusinessDays(friday, 5)          // Friday 2026-03-27

// With holidays
const usHolidays = d8.business.getHolidays('US', 2026)
d8.business.addBusinessDays(friday, 5, usHolidays)

// Count business days
d8.business.businessDaysBetween(
  d8('2026-03-01'),
  d8('2026-03-31')
)
```

## 11. Collections & Ranges

```typescript
import d8 from '@anilkumarthakur/d8'

// Collection
const col = d8.collection(['2026-03-01', '2026-01-15', '2026-06-10', '2026-01-15'])
col.sort('asc').first().format('YYYY-MM-DD')  // "2026-01-15"
col.unique().count()                           // 3
col.groupBy('month')                           // Map<string, DateFormat[]>
col.closest(d8('2026-02-01')).format('YYYY-MM-DD') // "2026-01-15"

// Range
const range = d8.range('2026-01-01', '2026-12-31')
range.contains('2026-06-15')        // true
range.duration().humanize(false)    // "364 days"
range.split(3, 'month')            // DateRange[] (4 chunks)
for (const day of range.iterate('month')) {
  console.log(day.format('MMM YYYY'))
}
```

## What's Next?

- [DateFormat](./dateformat) — Complete guide to the core class
- [API Reference](../api/) — Every method, typed & documented
- [Examples](../examples/) — Real-world recipes and patterns
