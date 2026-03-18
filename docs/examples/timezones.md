# Timezone Examples

## UTC Offset & DST

```typescript
import d8, { Timezone } from '@anilkumarthakur/d8'

const ny = new Timezone('America/New_York')
const winter = d8('2026-01-15T12:00:00Z')
const summer = d8('2026-07-15T12:00:00Z')

ny.offsetMinutes(winter)  // → -300 (UTC-5)
ny.offsetMinutes(summer)  // → -240 (UTC-4, DST)
ny.offsetString(winter)   // → "-05:00"
ny.offsetString(summer)   // → "-04:00"
ny.isDST(winter)          // → false
ny.isDST(summer)          // → true
```

## Cross-Timezone Formatting

```typescript
const utc = d8('2026-01-01T00:00:00Z') // UTC midnight

new Timezone('UTC').format(utc, 'YYYY-MM-DD HH:mm')
// → "2026-01-01 00:00"

new Timezone('Asia/Kolkata').format(utc, 'YYYY-MM-DD HH:mm')
// → "2026-01-01 05:30"

new Timezone('America/New_York').format(utc, 'YYYY-MM-DD HH:mm')
// → "2025-12-31 19:00"  (crosses date boundary!)
```

## Wall-Clock Conversion

```typescript
const kolkata = new Timezone('Asia/Kolkata')
const midnight = d8('2026-01-01T00:00:00Z')
const local = kolkata.toLocalDate(midnight)

local.get('hour')   // → 5
local.get('minute') // → 30
local.isUtc()       // → true (values represent wall-clock time)

const ny = new Timezone('America/New_York')
const nyLocal = ny.toLocalDate(d8('2026-01-15T12:00:00Z'))
nyLocal.get('hour') // → 7 (12:00 UTC - 5h)
```

## Validation

```typescript
Timezone.isValid('America/New_York')  // → true
Timezone.isValid('Asia/Kolkata')      // → true
Timezone.isValid('UTC')               // → true
Timezone.isValid('Invalid/Timezone')  // → false
Timezone.isValid('')                  // → false
Timezone.guess()                      // → e.g. "Asia/Kolkata"
```
