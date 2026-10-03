# DateFormat

The core class  80+ methods for creating, formatting, parsing, manipulating, and comparing dates.

## Creating Dates

```typescript
import snaptime from '@anil-labs/snaptime'

snaptime()                          // → current date/time
snaptime('2026-01-15')              // → 2026-01-15 (UTC mode, auto-detected from ISO string)
snaptime('2026-01-15T12:00:00Z')    // → 2026-01-15T12:00:00.000Z (UTC mode)
snaptime('2026-01-15T12:00:00+05:30') // → local mode (offset detected)
snaptime(1737100800000)             // → from timestamp (local mode)
snaptime(new Date())                // → from native Date (local mode)
snaptime(existingD8)                // → clone (preserves UTC flag)
```

### UTC Mode

```typescript
const utc = snaptime('2026-01-15', { utc: true })
utc.isUtc()   // → true
utc.isLocal() // → false

// ISO strings ending in Z are automatically UTC:
snaptime('2026-01-15T12:00:00Z').isUtc() // → true

// Strings with offset → local mode:
snaptime('2026-01-15T12:00:00+05:30').isLocal() // → true

// Invalid inputs:
snaptime('invalid string').isValid() // → false
snaptime(NaN).isValid()              // → false
```

### From Object

```typescript
import { DateFormat } from '@anil-labs/snaptime'

DateFormat.fromObject({ year: 2026, month: 3, day: 26 })
// → 2026-03-26T00:00:00.000Z

DateFormat.fromObject({ year: 2026, month: 1, day: 15, hour: 14, minute: 30 })
// → 2026-01-15T14:30:00.000Z

// Only year is required; other fields default to sensible values:
DateFormat.fromObject({ year: 2026 })
// → 2026-01-01T00:00:00.000Z
```

---

## Formatting

### Token Reference

| Token | Output | Example |
|:------|:-------|:--------|
| `YYYY` | 4-digit year | `2026` |
| `YY` | 2-digit year | `26` |
| `Q` | Quarter | `1` |
| `gg` | ISO week year | `2026` |
| `MMMM` | Full month | `January` |
| `MMM` | Short month | `Jan` |
| `MM` | Zero-padded month | `01` |
| `M` | Month number | `1` |
| `Mo` | Ordinal month | `1st` |
| `DDDD` | Zero-padded day of year | `015` |
| `DDD` | Day of year | `15` |
| `DD` | Zero-padded day | `15` |
| `D` | Day | `15` |
| `Do` | Ordinal day | `15th` |
| `WW` | Zero-padded ISO week | `02` |
| `W` | ISO week number | `2` |
| `dddd` | Full weekday | `Thursday` |
| `ddd` | Short weekday | `Thu` |
| `dd` | Min weekday | `Th` |
| `d` | Day index (0=Sun) | `4` |
| `HH` | 24h zero-padded | `12` |
| `H` | 24h | `12` |
| `hh` | 12h zero-padded | `12` |
| `h` | 12h | `12` |
| `mm` | Minutes padded | `00` |
| `m` | Minutes | `0` |
| `ss` | Seconds padded | `00` |
| `s` | Seconds | `0` |
| `SSS` | Milliseconds | `000` |
| `A` | AM/PM | `PM` |
| `a` | am/pm | `pm` |
| `X` | Unix seconds | `1768483200` |
| `x` | Unix milliseconds | `1768483200000` |
| `Z` | UTC offset (colon) | `+00:00` |
| `ZZ` | UTC offset (no colon) | `+0000` |

### Formatting Examples

```typescript
const d = snaptime('2026-01-15T12:00:00Z')

d.format('YYYY-MM-DD')          // → "2026-01-15"
d.format('MMMM Do, YYYY')      // → "January 15th, 2026"
d.format('dddd')                // → "Thursday"
d.format('hh:mm A')             // → "12:00 PM"
d.format('Q')                   // → "1"
d.format('DDD')                 // → "15"
d.format('DDDD')                // → "015"
d.format('WW')                  // → "02"
d.format()                      // → "2026-01-15 12:00:00" (default format)

// Invalid dates:
snaptime(NaN).format('YYYY-MM-DD')    // → "Invalid Date"

// Ordinals:
snaptime('2026-01-02T00:00:00Z').format('Do') // → "2nd"
snaptime('2026-01-03T00:00:00Z').format('Do') // → "3rd"
snaptime('2026-01-11T00:00:00Z').format('Do') // → "11th" (not "11st")
snaptime('2026-01-12T00:00:00Z').format('Do') // → "12th" (not "12nd")
snaptime('2026-01-13T00:00:00Z').format('Do') // → "13th" (not "13rd")

// AM/PM:
snaptime('2026-01-15T00:00:00Z').format('A')  // → "AM"
snaptime('2026-01-15T12:00:00Z').format('A')  // → "PM"

// 12-hour edge cases:
snaptime('2026-01-15T00:00:00Z').format('hh') // → "12" (midnight)
snaptime('2026-01-15T01:00:00Z').format('h')  // → "1"
```

### Escaping Text in Format Strings

Wrap literal text in square brackets `[...]` to prevent it from being interpreted as tokens:

```typescript
const d = snaptime('2026-01-15T12:00:00Z')

d.format('[Year:] YYYY')              // → "Year: 2026"
d.format('[Today is] dddd')           // → "Today is Thursday"
d.format('[Month] M [of] YYYY')      // → "Month 1 of 2026"
d.format('[It is] h:mm A [on] Do')   // → "It is 12:00 PM on 15th"
```

### Intl Formatting

```typescript
const d = snaptime('2026-01-15T12:00:00Z')

d.formatIntl({
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
})
// → "January 15, 2026"

d.formatIntl({
  weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC'
})
// → "Thursday, January 15"
```

---

## Parsing

```typescript
import { DateFormat } from '@anil-labs/snaptime'

DateFormat.parse('2026-03-25', 'YYYY-MM-DD')
// → valid DateFormat: year=2026, month=3, date=25

DateFormat.parse('2026-06-10 14:30:45', 'YYYY-MM-DD HH:mm:ss')
// → valid, hour=14, minute=30, second=45

DateFormat.parse('not-a-date', 'YYYY-MM-DD')
// → invalid: .isValid() === false
```

### Strict Mode

```typescript
DateFormat.parse('2026-01-15', 'YYYY-MM-DD', true)
// → valid, local mode (date-only → local midnight)

DateFormat.parse('2026-13-01', 'YYYY-MM-DD', true)
// → invalid: month 13 out of range

DateFormat.parse('2026-01-32', 'YYYY-MM-DD', true)
// → invalid: day 32 out of range

DateFormat.parse('2026-01-00', 'YYYY-MM-DD', true)
// → invalid: day 0 out of range

DateFormat.parse('2026-00-01', 'YYYY-MM-DD', true)
// → invalid: month 0 out of range

// Partial format  only year:
DateFormat.parse('2026', 'YYYY', true)
// → valid (no month/day to validate)
```

### Unix Timestamp Parsing

```typescript
DateFormat.parse('1768483200000', 'x')   // → from Unix ms
DateFormat.parse('1768483200', 'X')       // → from Unix seconds
```

### Timezone Offset Parsing

```typescript
DateFormat.parse('2026-01-15T12:00:00+05:30', 'YYYY-MM-DDTHH:mm:ssZ')
DateFormat.parse('2026-01-15T12:00:00Z', 'YYYY-MM-DDTHH:mm:ssZ')
// → .isUtc() === true (Z detected)
```

---

## Getters & Setters

```typescript
const d = snaptime('2026-06-15T14:30:45.123Z')

d.get('year')        // → 2026
d.get('month')       // → 6 (1-indexed, not 0-indexed!)
d.get('date')        // → 15
d.get('day')         // → 1 (Monday; 0=Sun, 1=Mon, ..., 6=Sat)
d.get('hour')        // → 14
d.get('minute')      // → 30
d.get('second')      // → 45
d.get('millisecond') // → 123

// Set returns a NEW instance (immutable):
const updated = d.set('year', 2030)
d.get('year')        // → 2026 (original unchanged)
updated.get('year')  // → 2030

d.valueOf()  // → milliseconds since epoch
d.unix()     // → seconds since epoch (floored)
```

::: warning Unsupported units
`get('fortnight')` and `set('fortnight', 1)` throw `Unknown unit "fortnight"`.
:::

---

## Unit Aliases

All methods that accept a unit string (e.g. `get`, `set`, `add`, `subtract`, `startOf`, `endOf`, `diff`) also accept short aliases and plural forms:

| Full Name      | Short Alias | Plural Forms         |
|:---------------|:------------|:---------------------|
| `year`         | `y`         | `years`              |
| `month`        | `M`         | `months`             |
| `day`          | `d`         | `days`               |
| `hour`         | `h`         | `hours`              |
| `minute`       | `m`         | `minutes`            |
| `second`       | `s`         | `seconds`            |
| `millisecond`  | `ms`        | `milliseconds`       |
| `week`         | `w`         | `weeks`              |

```typescript
const d = snaptime('2026-06-15T14:30:45.123Z')

// Short aliases:
d.get('y')               // → 2026
d.get('M')               // → 6
d.get('d')               // → 15 (date)
d.add(1, 'w')            // → adds 1 week
d.startOf('h')           // → start of the hour
d.diff(other, 's')       // → diff in seconds

// Plural forms:
d.add(3, 'days')         // → same as d.add(3, 'day')
d.subtract(2, 'hours')   // → same as d.subtract(2, 'hour')
d.startOf('months')      // → same as d.startOf('month')
```

::: tip Note on case sensitivity
The short alias `M` (month) is uppercase to distinguish it from `m` (minute).
:::

---

## Arithmetic

```typescript
const d = snaptime('2026-01-15T12:00:00Z')

d.add(3, 'day').format('YYYY-MM-DD')      // → "2026-01-18"
d.add(1, 'month').get('month')             // → 2
d.add(1, 'year').get('year')               // → 2027
d.subtract(1, 'day').format('YYYY-MM-DD')  // → "2026-01-14"

// Subtract is add with negative:
d.subtract(1, 'day').valueOf() === d.add(-1, 'day').valueOf() // → true

// Unknown unit throws:
d.add(1, 'unknown') // → throws Error: 'Unknown unit "unknown"'
```

### Start & End of Period

```typescript
const d = snaptime('2026-06-15T14:30:45.500Z')

d.startOf('year').format('YYYY-MM-DD HH:mm:ss')    // → "2026-01-01 00:00:00"
d.startOf('month').format('YYYY-MM-DD')             // → "2026-06-01"
d.startOf('quarter').format('YYYY-MM-DD')            // → "2026-04-01" (Q2 → April 1)
d.startOf('day').format('HH:mm:ss')                 // → "00:00:00"
d.startOf('hour').format('mm:ss')                   // → "00:00"
d.startOf('minute').format('ss.SSS')                // → "00.000"
d.startOf('second').format('SSS')                   // → "000"

d.endOf('day').format('HH:mm:ss.SSS')              // → "23:59:59.999"
d.endOf('month').get('date')                         // → 30 (June has 30 days)
snaptime('2026-02-15').endOf('month').get('date')          // → 28 (non-leap year)
```

---

## Comparisons

```typescript
const a = snaptime('2026-01-15T12:00:00Z')
const b = snaptime('2026-01-16T12:00:00Z')

a.isBefore(b) // → true
b.isBefore(a) // → false

b.isAfter(a)  // → true
a.isAfter(b)  // → false

a.isSame(a.clone()) // → true
a.isSame(b)         // → false

// isSame with unit granularity:
const c = snaptime('2026-01-15T18:00:00Z')
a.isSame(c, 'day')    // → true  (same calendar day)
a.isSame(c, 'hour')   // → false (different hour)
a.isSame(b, 'month')  // → true  (both January 2026)
a.isSame(b, 'year')   // → true  (both 2026)

// isSameOrBefore / isSameOrAfter:
a.isSameOrBefore(b)           // → true
a.isSameOrBefore(a.clone())   // → true
b.isSameOrBefore(a)           // → false

b.isSameOrAfter(a)            // → true
a.isSameOrAfter(a.clone())    // → true
a.isSameOrAfter(b)            // → false

// With unit granularity:
a.isSameOrBefore(c, 'day')    // → true  (same day)
a.isSameOrAfter(c, 'month')   // → true  (same month)

// isBetween  default is exclusive '()' on both boundaries:
const mid = snaptime('2026-01-15T18:00:00Z')
mid.isBetween(a, b) // → true
a.isBetween(a, b)   // → false (on boundary)
b.isBetween(a, b)   // → false (on boundary)

// isBetween with inclusivity:
a.isBetween(a, b, undefined, '[]')  // → true  (inclusive on both ends)
b.isBetween(a, b, undefined, '[]')  // → true
a.isBetween(a, b, undefined, '[)')  // → true  (inclusive start, exclusive end)
b.isBetween(a, b, undefined, '[)')  // → false
a.isBetween(a, b, undefined, '(]')  // → false (exclusive start, inclusive end)
b.isBetween(a, b, undefined, '(]')  // → true

// isBetween with unit granularity:
mid.isBetween(a, b, 'day')          // → true (compared at day level)
```

### Diff

```typescript
const a = snaptime('2026-01-15T12:00:00Z')
const b = snaptime('2026-01-16T12:00:00Z')

b.diff(a, 'day')               // → 1
b.diff(a, 'hour')              // → 24
b.diff(a, 'millisecond')       // → 86400000
b.diff('2026-01-15T12:00:00Z') // → 86400000 (default: ms, accepts string)

// Floating precision:
const c = snaptime('2026-01-15T18:00:00Z')
c.diff(a, 'day', true)         // → 0.25
```

---

## Day-of-Week Checks

```typescript
// 2026: Jan 11=Sun, 12=Mon, 13=Tue, 14=Wed, 15=Thu, 16=Fri, 17=Sat
snaptime('2026-01-11').isSunday()    // → true
snaptime('2026-01-12').isMonday()    // → true
snaptime('2026-01-13').isTuesday()   // → true
snaptime('2026-01-14').isWednesday() // → true
snaptime('2026-01-15').isThursday()  // → true
snaptime('2026-01-16').isFriday()    // → true
snaptime('2026-01-17').isSaturday()  // → true

snaptime('2026-01-12').isWeekday()   // → true  (Mon-Fri)
snaptime('2026-01-17').isWeekday()   // → false (Saturday)
snaptime('2026-01-17').isWeekend()   // → true  (Sat/Sun)
snaptime('2026-01-12').isWeekend()   // → false (Monday)
```

---

## Period Checks

Each period has four methods: `isSame*`, `isCurrent*`, `isNext*`, `isLast*`.

```typescript
// Assuming "now" is 2026-01-15 (Thursday, Q1)
const d = snaptime('2026-01-15')

// Year
d.isCurrentYear()                               // → true
snaptime('2027-01-15').isNextYear()                    // → true
snaptime('2025-01-15').isLastYear()                    // → true
d.isSameYear(snaptime('2026-06-01'))                   // → true
d.isSameYear(snaptime('2025-01-15'))                   // → false

// Month
d.isCurrentMonth()                               // → true
snaptime('2026-02-15').isNextMonth()                   // → true
snaptime('2025-12-15').isLastMonth()                   // → true

// Week
d.isCurrentWeek()                                // → true
snaptime('2026-01-22').isNextWeek()                    // → true
snaptime('2026-01-08').isLastWeek()                    // → true
d.isSameWeek(snaptime('2026-01-14'))                   // → true

// Day
d.isCurrentDay()                                 // → true
snaptime('2026-01-16').isNextDay()                     // → true
snaptime('2026-01-14').isLastDay()                     // → true

// Quarter
d.isCurrentQuarter()                             // → true  (Q1)
snaptime('2026-04-15').isNextQuarter()                 // → true  (Q2)
snaptime('2025-10-15').isLastQuarter()                 // → true  (Q4 2025)

// Decade
d.isCurrentDecade()                              // → true  (2020s)
snaptime('2030-01-01').isNextDecade()                  // → true  (2030s)
snaptime('2010-01-01').isLastDecade()                  // → true  (2010s)
d.isSameDecade(snaptime('2020-06-01'))                 // → true

// Century
d.isCurrentCentury()                             // → true
snaptime('2100-01-01').isNextCentury()                 // → true
snaptime('1999-12-31').isLastCentury()                 // → true

// Millennium
d.isCurrentMillennium()                          // → true
snaptime('3000-01-01').isNextMillennium()              // → true
snaptime('1500-01-01').isLastMillennium()              // → true
d.isSameMillennium(snaptime('2500-01-01'))             // → true
```

### Semantic Day Checks

```typescript
// Assuming "now" is 2026-01-15
snaptime('2026-01-15').isToday()     // → true
snaptime('2026-01-16').isToday()     // → false

snaptime('2026-01-16').isTomorrow()  // → true
snaptime('2026-01-15').isTomorrow()  // → false

snaptime('2026-01-14').isYesterday() // → true
snaptime('2026-01-15').isYesterday() // → false
```

### Hour / Minute / Second / Millisecond

```typescript
const now = snaptime('2026-01-15T12:00:00.000Z')

now.isCurrentHour()                              // → true
snaptime('2026-01-15T13:00:00Z').isNextHour()          // → true
snaptime('2026-01-15T11:00:00Z').isLastHour()          // → true
now.isSameHour(snaptime('2026-01-15T12:30:00Z'))       // → true

now.isCurrentMinute()                            // → true
snaptime('2026-01-15T12:01:00Z').isNextMinute()        // → true
now.isSameMinute(snaptime('2026-01-15T12:00:30Z'))     // → true

now.isCurrentSecond()                            // → true
snaptime('2026-01-15T12:00:01Z').isNextSecond()        // → true

// Microsecond aliases (mapped to millisecond in JS):
now.isSameMicro(now.clone())                     // → true
now.isSameMicrosecond(now.clone())               // → true
```

---

## Relative Time

### fromNow()

```typescript
// Assuming now = 2026-01-15T12:00:00Z
snaptime('2026-01-15T12:00:30Z').fromNow()   // → "in 30 seconds"
snaptime('2026-01-15T12:05:00Z').fromNow()   // → "in 5 minutes"
snaptime('2026-01-15T15:00:00Z').fromNow()   // → "in 3 hours"
snaptime('2026-01-17T12:00:00Z').fromNow()   // → "in 2 days"
snaptime('2026-01-14T12:00:00Z').fromNow()   // → "1 day ago"
snaptime('2026-01-12T12:00:00Z').fromNow()   // → "3 days ago"

// Singular forms:
snaptime('2026-01-15T12:00:01Z').fromNow()   // → "in 1 second"
snaptime('2026-01-15T12:01:00Z').fromNow()   // → "in 1 minute"
snaptime('2026-01-15T13:00:00Z').fromNow()   // → "in 1 hour"
snaptime('2026-01-16T12:00:00Z').fromNow()   // → "in 1 day"

// Sub-second precision:
snaptime('2026-01-15T12:00:00.500Z').fromNow() // → "in 500 milliseconds"
snaptime('2026-01-15T12:00:00.001Z').fromNow() // → "in 1 millisecond"
```

::: tip Locale-aware relative time
When a locale is registered with a `relativeTime` configuration, `fromNow()` will use the locale's `relativeTime` strings instead of the English defaults. Register a locale with `DateFormat.locale()` to enable this.
:::

### calendar()

```typescript
// Assuming now = 2026-01-15T12:00:00Z
snaptime(Date.now()).calendar()                           // → "Today at 12:00 PM" (approx)
snaptime(Date.now() - 86400000).calendar()                // → "Yesterday at ..."
snaptime(Date.now() + 86400000).calendar()                // → "Tomorrow at ..."
snaptime(Date.now() - 7 * 86400000).calendar()            // → "2026-01-08"
```

### preciseDiff()

```typescript
const a = snaptime('2024-03-10T00:00:00Z')
const b = snaptime('2025-05-15T00:00:00Z')
const diff = b.preciseDiff(a)

diff.years   // → 1
diff.months  // → 2
diff.days    // → 5
diff.humanize() // → "1 year, 2 months, 5 days"

// Same date:
d.preciseDiff(d.clone()).humanize() // → "just now"

// Hours/minutes/seconds:
const x = snaptime('2026-01-15T09:00:00Z')
const y = snaptime('2026-01-15T12:10:30Z')
const r = y.preciseDiff(x)
r.hours   // → 3
r.minutes // → 10
r.seconds // → 30
```

### preciseFrom()

```typescript
const a = snaptime('2024-01-01T00:00:00Z')
const b = snaptime('2025-06-15T00:00:00Z')

b.preciseFrom(a)
// → same as b.preciseDiff(a).humanize()
// → "1 year, 5 months, 14 days"
```

### age()

```typescript
// Assuming now = 2026-01-15
const birthdate = snaptime('2024-01-15T00:00:00Z')
const a = birthdate.age()

a.years      // → 2
a.months     // → 0
a.days       // → 0
a.toString() // → "2y"

// With months and days:
snaptime('2025-10-10T00:00:00Z').age().toString()
// → "3mo 5d" (approximately)

// Today → zero age:
snaptime(Date.now()).age().toString() // → "0d"
```

### countdown()

```typescript
// Assuming now = 2026-01-15T12:00:00Z
const future = snaptime('2026-01-17T15:00:00Z')
const cd = future.countdown()

cd.isPast  // → false
cd.days    // → 2
cd.hours   // → 3
cd.humanize() // → "2 days, 3 hours"

cd.format('DD:HH:mm:ss') // → "02:03:00:00"

// Past dates:
snaptime('2026-01-14T12:00:00Z').countdown().isPast     // → true
snaptime('2026-01-14T12:00:00Z').countdown().humanize()  // → "already passed"

// Near-zero:
snaptime('2026-01-15T12:00:00.500Z').countdown().humanize() // → "now"

// Singular forms:
snaptime('2026-01-16T12:00:00Z').countdown().humanize() // → "1 day" (not "1 days")
snaptime('2026-01-15T13:00:00Z').countdown().humanize() // → "1 hour"
snaptime('2026-01-15T12:01:00Z').countdown().humanize() // → "1 minute"
snaptime('2026-01-15T12:00:01Z').countdown().humanize() // → "1 second"
```

---

## Calendar Grid

```typescript
const jan = snaptime('2026-01-15')
const grid = jan.calendarGrid({ weekStart: 'sunday' })

grid.length        // → 6 (rows)
grid[0].length     // → 7 (columns)
grid.flat().length // → 42 (total cells)

// Each cell has:
// { date: DateFormat, isCurrentMonth: boolean, isToday: boolean, isWeekend: boolean }

// First cell is a Sunday (Jan 2026 starts on Thursday):
grid[0][0].isCurrentMonth // → false (previous month)
grid[0][0].date.get('month') // → 12 (December 2025)

// With Monday start:
const mondayGrid = jan.calendarGrid({ weekStart: 'monday' })
mondayGrid[0][0].date.get('day') // → 1 (Monday)
```

---

## Calendar Helpers

```typescript
// Days in month
snaptime('2024-02-15').daysInMonth() // → 29 (leap year)
snaptime('2025-02-15').daysInMonth() // → 28 (non-leap year)
snaptime('2026-04-10').daysInMonth() // → 30
snaptime('2026-01-01').daysInMonth() // → 31

// Day of year
snaptime('2026-01-01').dayOfYear()   // → 1
snaptime('2025-12-31').dayOfYear()   // → 365
snaptime('2025-02-28').dayOfYear()   // → 59

// Leap year
snaptime('2000-06-01').isLeapYear()  // → true  (divisible by 400)
snaptime('1900-06-01').isLeapYear()  // → false (divisible by 100 but not 400)
snaptime('2024-01-01').isLeapYear()  // → true
snaptime('2025-01-01').isLeapYear()  // → false
```

---

## ISO Week & Year

```typescript
snaptime('2026-01-15').isoWeek()     // → 2
snaptime('2026-01-01').isoWeek()     // → 53 (belongs to previous ISO year)
snaptime('2026-06-15').isoWeekYear() // → 2026
snaptime('2026-01-15').week()        // → 2 (alias for isoWeek())
snaptime('2018-01-01').weeksInYear() // → 52
snaptime('2015-01-01').weeksInYear() // → 53
```

---

## Quarters

```typescript
snaptime('2026-01-15').quarter() // → 1
snaptime('2026-03-31').quarter() // → 1
snaptime('2026-04-01').quarter() // → 2
snaptime('2026-06-30').quarter() // → 2
snaptime('2026-07-01').quarter() // → 3
snaptime('2026-10-01').quarter() // → 4
snaptime('2026-12-31').quarter() // → 4
```

---

## Fiscal Year

```typescript
// Default (startMonth=1) → same as calendar year:
snaptime('2026-06-15').fiscalYear()                     // → 2026
snaptime('2026-06-15').fiscalYear({ startMonth: 1 })    // → 2026

// India-style (Apr–Mar):
snaptime('2026-04-01').fiscalYear({ startMonth: 4 })    // → 2027
snaptime('2026-12-31').fiscalYear({ startMonth: 4 })    // → 2027
snaptime('2026-03-31').fiscalYear({ startMonth: 4 })    // → 2026

// Fiscal quarters:
snaptime('2026-01-15').fiscalQuarter({ startMonth: 1 }) // → 1
snaptime('2026-04-01').fiscalQuarter({ startMonth: 1 }) // → 2
snaptime('2026-07-01').fiscalQuarter({ startMonth: 1 }) // → 3
snaptime('2026-10-01').fiscalQuarter({ startMonth: 1 }) // → 4

// With April start:
snaptime('2026-04-01').fiscalQuarter({ startMonth: 4 }) // → 1
snaptime('2026-07-01').fiscalQuarter({ startMonth: 4 }) // → 2
snaptime('2026-10-01').fiscalQuarter({ startMonth: 4 }) // → 3
snaptime('2026-01-01').fiscalQuarter({ startMonth: 4 }) // → 4
```

---

## Serialization

```typescript
const d = snaptime('2026-01-15T12:00:00.000Z')

d.toISOString() // → "2026-01-15T12:00:00.000Z"
d.toJSON()      // → "2026-01-15T12:00:00.000Z" (same, used by JSON.stringify)
d.toSQL()       // → "2026-01-15 12:00:00"
d.toSQLDate()   // → "2026-01-15"
d.toSQLTime()   // → "12:00:00"
d.toRFC2822()   // → "Thu, 15 Jan 2026 12:00:00 +0000"
d.toRFC3339()   // → "2026-01-15T12:00:00Z"
d.toExcel()     // → ~46031 (days since Dec 30, 1899)
d.toMillis()    // → 1768483200000 (same as valueOf())

d.toObject()
// → { year: 2026, month: 1, date: 15, hour: 12, minute: 0, second: 0, millisecond: 0 }

d.toDate()      // → native JavaScript Date instance

d.toString()    // → "2026-01-15T12:00:00.000Z" (ISO string for valid dates)
snaptime(NaN).toString() // → "Invalid Date"
```

---

## UTC / Local Conversion

```typescript
const local = snaptime(1768483200000)
local.isLocal() // → true

const utc = local.utc()
utc.isUtc()     // → true

const back = utc.local()
back.isLocal()  // → true
```

---

## Static Methods

```typescript
import { DateFormat } from '@anil-labs/snaptime'

// Min / Max
const a = snaptime('2026-01-01'), b = snaptime('2026-06-01'), c = snaptime('2025-12-01')
DateFormat.min(a, b, c).get('year')  // → 2025
DateFormat.max(a, b, c).get('month') // → 6

// Duration
const dur = DateFormat.duration(2, 'hour')
dur.valueOf() // → 7200000

// Plugin
DateFormat.use(() => { /* plugin logic */ })

// Locale
DateFormat.locale('es', { months: ['Enero', ...] })
```
