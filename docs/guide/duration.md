# Duration

Time span representation with parsing, conversion, arithmetic, and humanization.

## Creating Durations

```typescript
import { Duration, DateFormat } from '@anilkumarthakur/d8'

new Duration()        // → 0ms
new Duration(5000)    // → 5 seconds
new Duration(-500)    // → negative 500ms

// Via static helper:
DateFormat.duration(2, 'hour') // → Duration(7200000)
```

## Parsing from String

```typescript
Duration.parse('')              // → 0ms
Duration.parse('1Y')            // → 31536000000ms (365 days)
Duration.parse('1y')            // → 31536000000ms (same as 1Y)
Duration.parse('1M')            // → 2592000000ms (30 days)
Duration.parse('1w')            // → 604800000ms (7 days)
Duration.parse('1d')            // → 86400000ms
Duration.parse('1h')            // → 3600000ms
Duration.parse('1m')            // → 60000ms
Duration.parse('1s')            // → 1000ms
Duration.parse('1ms')           // → 1ms
Duration.parse('1.5h')          // → 5400000ms (1.5 hours)

// Combined:
Duration.parse('1d2h30m')       // → 95400000ms (1 day + 2 hours + 30 min)
Duration.parse('2Y3M1w4d5h6m7s8ms')
// → 2 years + 3 months + 1 week + 4 days + 5 hours + 6 min + 7 sec + 8 ms
```

**Tokens:** `Y/y` (years), `M` (months), `w` (weeks), `d` (days), `h` (hours), `m` (minutes), `s` (seconds), `ms` (milliseconds).

---

## Unit Conversion

```typescript
const d = new Duration(31536000000) // 1 year = 365 days

d.as('millisecond') // → 31536000000
d.as('second')      // → 31536000
d.as('minute')      // → 525600
d.as('hour')        // → 8760
d.as('day')         // → 365
d.as('date')        // → 365 (alias for day)
d.as('week')        // → ~52.14
d.as('month')       // → ~12.17
d.as('year')        // → 1
d.as('fortnight')   // → ~26.07

// Convenience aliases:
d.toMilliseconds()  // → 31536000000
d.toSeconds()       // → 31536000
d.toMinutes()       // → 525600
d.toHours()         // → 8760
d.toDays()          // → 365
```

---

## Arithmetic

```typescript
const base = new Duration(0)

base.add(500, 'millisecond').valueOf()  // → 500
base.add(1, 'second').valueOf()         // → 1000
base.add(1, 'minute').valueOf()         // → 60000
base.add(1, 'hour').valueOf()           // → 3600000
base.add(1, 'day').valueOf()            // → 86400000
base.add(1, 'week').valueOf()           // → 604800000
base.add(1, 'month').valueOf()          // → 2592000000
base.add(1, 'year').valueOf()           // → 31536000000
base.add(1, 'fortnight').valueOf()      // → 1209600000

// Subtract:
new Duration(86400000).subtract(1, 'hour').valueOf()
// → 82800000 (1 day - 1 hour)

// Subtract is inverse of add:
new Duration(10000).subtract(5, 'second').valueOf()
=== new Duration(10000).add(-5, 'second').valueOf()
// → true

// Unknown unit throws:
base.add(1, 'unknown') // → throws: 'Cannot add/subtract unit "unknown"'
```

---

## Humanize

### Short Form (default)

```typescript
new Duration(0).humanize()         // → "0ms"
new Duration(500).humanize()       // → "500ms"
new Duration(999).humanize()       // → "999ms"
new Duration(1000).humanize()      // → "1s"
new Duration(30000).humanize()     // → "30s"
new Duration(300000).humanize()    // → "5m"
new Duration(10800000).humanize()  // → "3h"
new Duration(172800000).humanize() // → "2d"

// Negative → uses absolute value:
new Duration(-172800000).humanize() // → "2d"
```

### Long Form

```typescript
new Duration(0).humanize(false)              // → "0 milliseconds"
new Duration(1).humanize(false)              // → "1 millisecond"
new Duration(500).humanize(false)            // → "500 milliseconds"
new Duration(1000).humanize(false)           // → "1 second"
new Duration(30000).humanize(false)          // → "30 seconds"
new Duration(60000).humanize(false)          // → "1 minute"
new Duration(3600000).humanize(false)        // → "1 hour"
new Duration(86400000).humanize(false)       // → "1 day"
new Duration(172800000).humanize(false)      // → "2 days"

// Combined:
new Duration(90000000).humanize(false)       // → "1 day, 1 hour"
Duration.parse('2d3h15m').humanize(false)    // → "2 days, 3 hours, 15 minutes"

// Milliseconds hidden when larger units present:
new Duration(86400500).humanize(false)       // → "1 day"

// Negative → uses abs:
new Duration(-86400000).humanize(false)      // → "1 day"
```

---

## Format

```typescript
const d = new Duration(2 * 3600000 + 5 * 60000 + 3 * 1000 + 50)
// 2h 5m 3s 50ms

d.format('HH:mm:ss.SSS')  // → "02:05:03.050"
d.format('H:m:s')          // → "2:5:3"
d.format('H')              // → "2"
d.format('m')              // → "5"
d.format('s')              // → "3"

new Duration(300000).format('HH:mm:ss') // → "00:05:00"
new Duration(7).format('SSS')          // → "007"
new Duration(0).format('HH:mm:ss.SSS') // → "00:00:00.000"

// Large hours:
new Duration(360000000).format('H')     // → "100"
```

---

## Inspection

```typescript
new Duration(0).isZero()        // → true
new Duration(100).isZero()      // → false

new Duration(-500).isNegative() // → true
new Duration(0).isNegative()    // → false
new Duration(1).isNegative()    // → false

new Duration(-3600000).abs().valueOf() // → 3600000
new Duration(3600000).abs().valueOf()  // → 3600000
new Duration(0).abs().valueOf()        // → 0
```

---

## toString

```typescript
new Duration(10800000).toString() // → "3h" (same as humanize(true))
new Duration(500).toString()      // → "500ms"
```
