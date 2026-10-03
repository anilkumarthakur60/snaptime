# Business Day Examples

## Basic Checks

```typescript
import snaptime from '@anil-labs/snaptime'
import { isBusinessDay, addBusinessDays, nextBusinessDay, prevBusinessDay,
         businessDaysBetween, getHolidays } from '@anil-labs/snaptime'

isBusinessDay(snaptime('2026-01-12'))  // → true  (Monday)
isBusinessDay(snaptime('2026-01-17'))  // → false (Saturday)
isBusinessDay(snaptime('2026-01-18'))  // → false (Sunday)
```

## Navigating Business Days

```typescript
addBusinessDays(snaptime('2026-01-12'), 1).format('YYYY-MM-DD')
// → "2026-01-13" (Mon → Tue)

addBusinessDays(snaptime('2026-01-16'), 1).format('YYYY-MM-DD')
// → "2026-01-19" (Fri → Mon, skips weekend)

addBusinessDays(snaptime('2026-01-12'), 5).format('YYYY-MM-DD')
// → "2026-01-19" (Mon + 5 biz days → next Mon)

nextBusinessDay(snaptime('2026-01-16')).format('YYYY-MM-DD')
// → "2026-01-19" (Fri → Mon)

nextBusinessDay(snaptime('2026-01-17')).format('YYYY-MM-DD')
// → "2026-01-19" (Sat → Mon)

prevBusinessDay(snaptime('2026-01-12')).format('YYYY-MM-DD')
// → "2026-01-09" (Mon → prev Fri)

prevBusinessDay(snaptime('2026-01-18')).format('YYYY-MM-DD')
// → "2026-01-16" (Sun → Fri)
```

## Counting Between

```typescript
businessDaysBetween(snaptime('2026-01-12'), snaptime('2026-01-16'))
// → 3 (Tue, Wed, Thu  exclusive of endpoints)

businessDaysBetween(snaptime('2026-01-12'), snaptime('2026-01-19'))
// → 4 (skips weekend)

businessDaysBetween(snaptime('2026-01-16'), snaptime('2026-01-12'))
// → -3 (negative when end < start)
```

## With Holidays

```typescript
const usHolidays = getHolidays('US', 2026)

isBusinessDay(snaptime('2026-01-01'), usHolidays)
// → false (New Year's Day is a Thursday)

addBusinessDays(snaptime('2026-01-16'), 1, ['2026-01-19']).format('YYYY-MM-DD')
// → "2026-01-20" (Fri + 1, Mon is holiday → Tue)

businessDaysBetween(snaptime('2026-01-12'), snaptime('2026-01-16'), ['2026-01-14'])
// → 2 (Wed excluded as holiday)
```

## Holiday Lists

```typescript
getHolidays('US', 2026).includes('2026-01-01')  // → true (New Year's)
getHolidays('US', 2026).includes('2026-07-04')  // → true (Independence Day)
getHolidays('US', 2026).includes('2026-12-25')  // → true (Christmas)
getHolidays('UK', 2026).includes('2026-04-03')  // → true (Good Friday)
getHolidays('UK', 2026).includes('2026-04-06')  // → true (Easter Monday)
getHolidays('IN', 2026).includes('2026-01-26')  // → true (Republic Day)
getHolidays('DE', 2026).includes('2026-10-03')  // → true (German Unity Day)
getHolidays('FR', 2026).includes('2026-07-14')  // → true (Bastille Day)
getHolidays('CA', 2026).includes('2026-07-01')  // → true (Canada Day)
getHolidays('AU', 2026).includes('2026-01-26')  // → true (Australia Day)
getHolidays('ZZ', 2026)                          // → [] (unknown country)
getHolidays('us', 2026).includes('2026-01-01')  // → true (case-insensitive)
```
