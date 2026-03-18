# Timezone

IANA timezone support using the built-in `Intl` API — format in any timezone, get offsets, detect DST, and convert wall-clock times.

## Creating Timezones

```typescript
import { Timezone } from '@anilkumarthakur/d8'

const ny = new Timezone('America/New_York')
ny.tz // → "America/New_York"

const kolkata = new Timezone('Asia/Kolkata')
const utcTz = new Timezone('UTC')

// Invalid → throws RangeError:
new Timezone('Invalid/Timezone') // → throws RangeError
new Timezone('')                 // → throws RangeError
```

---

## Static Methods

```typescript
// Guess the system's local timezone:
Timezone.guess()
// → e.g. "Asia/Kolkata" (depends on system)

// Validate timezone strings:
Timezone.isValid('UTC')             // → true
Timezone.isValid('America/New_York') // → true
Timezone.isValid('Asia/Kolkata')    // → true
Timezone.isValid('Invalid/Timezone') // → false
Timezone.isValid('')                // → false
```

---

## Offset

```typescript
import d8 from '@anilkumarthakur/d8'

const ny = new Timezone('America/New_York')
const kolkata = new Timezone('Asia/Kolkata')
const utcTz = new Timezone('UTC')

const jan = d8('2026-01-15T12:00:00Z') // Winter
const jul = d8('2026-07-15T12:00:00Z') // Summer

// UTC offset in minutes:
utcTz.offsetMinutes(jan)  // → 0
kolkata.offsetMinutes(jan) // → 330 (UTC+5:30)
ny.offsetMinutes(jan)      // → -300 (UTC-5:00, standard time)
ny.offsetMinutes(jul)      // → -240 (UTC-4:00, DST)

// UTC offset as string:
utcTz.offsetString(jan)  // → "+00:00"
kolkata.offsetString(jan) // → "+05:30"
ny.offsetString(jan)      // → "-05:00"
ny.offsetString(jul)      // → "-04:00"

// No argument → uses current time:
utcTz.offsetMinutes()  // → 0
utcTz.offsetString()   // → "+00:00"
```

---

## Format in Timezone

```typescript
const ny = new Timezone('America/New_York')
const kolkata = new Timezone('Asia/Kolkata')
const utcTz = new Timezone('UTC')

// UTC midnight:
const midnight = d8('2026-01-01T00:00:00Z')

utcTz.format(midnight, 'YYYY-MM-DD')    // → "2026-01-01"
kolkata.format(midnight, 'YYYY-MM-DD')   // → "2026-01-01" (05:30 → still Jan 1)
ny.format(midnight, 'YYYY-MM-DD')        // → "2025-12-31" (UTC-5 → Dec 31!)
kolkata.format(midnight, 'HH:mm')        // → "05:30"

const noon = d8('2026-01-15T12:00:00Z')
ny.format(noon, 'HH:mm')                // → "07:00" (12:00 UTC - 5h)
```

---

## DST Detection

```typescript
const ny = new Timezone('America/New_York')
const kolkata = new Timezone('Asia/Kolkata')
const utcTz = new Timezone('UTC')

const jan = d8('2026-01-15T12:00:00Z')
const jul = d8('2026-07-15T12:00:00Z')

// UTC → never DST:
utcTz.isDST(jan) // → false
utcTz.isDST(jul) // → false

// New York → DST in summer:
ny.isDST(jan)    // → false (standard time)
ny.isDST(jul)    // → true  (DST)

// India → no DST:
kolkata.isDST(jan) // → false
kolkata.isDST(jul) // → false
```

---

## Wall-Clock Conversion

```typescript
const kolkata = new Timezone('Asia/Kolkata')
const ny = new Timezone('America/New_York')
const utcTz = new Timezone('UTC')

const midnight = d8('2026-01-01T00:00:00Z')

// toLocalDate returns a DateFormat (UTC mode) with wall-clock values:
const kolkataLocal = kolkata.toLocalDate(midnight)
kolkataLocal.get('hour')   // → 5
kolkataLocal.get('minute') // → 30
kolkataLocal.isUtc()       // → true (numeric components = wall-clock in this tz)

const nyLocal = ny.toLocalDate(d8('2026-01-15T12:00:00Z'))
nyLocal.get('hour')   // → 7  (12:00 UTC - 5h)
nyLocal.get('minute') // → 0

const utcLocal = utcTz.toLocalDate(midnight)
utcLocal.get('hour')   // → 0
utcLocal.get('minute') // → 0
```

---

## toString

```typescript
new Timezone('UTC').toString()             // → "UTC"
new Timezone('Asia/Kolkata').toString()    // → "Asia/Kolkata"
new Timezone('America/New_York').toString() // → "America/New_York"
```

---

## World Clock Example

```typescript
import d8, { Timezone } from '@anilkumarthakur/d8'

const now = d8()
const cities = [
  { name: 'New York',  tz: new Timezone('America/New_York') },
  { name: 'London',    tz: new Timezone('Europe/London') },
  { name: 'Mumbai',    tz: new Timezone('Asia/Kolkata') },
  { name: 'Tokyo',     tz: new Timezone('Asia/Tokyo') },
  { name: 'Sydney',    tz: new Timezone('Australia/Sydney') },
]

for (const city of cities) {
  const time = city.tz.format(now, 'hh:mm A')
  const offset = city.tz.offsetString(now)
  const dst = city.tz.isDST(now) ? ' (DST)' : ''
  console.log(`${city.name}: ${time} ${offset}${dst}`)
}
// → New York: 07:00 AM -05:00
// → London:   12:00 PM +00:00
// → Mumbai:   05:30 PM +05:30
// → Tokyo:    09:00 PM +09:00
// → Sydney:   11:00 PM +11:00 (DST)
// (values depend on the actual current time)
```
