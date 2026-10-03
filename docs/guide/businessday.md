# Business Days

Functions for business day calculations  skip weekends and holidays, count business days, find next/previous, and get holiday lists for 7 countries.

## isBusinessDay

```typescript
import { isBusinessDay, getHolidays } from '@anil-labs/snaptime'
import snaptime from '@anil-labs/snaptime'

// Weekdays → true:
isBusinessDay(snaptime('2026-01-12')) // → true  (Monday)
isBusinessDay(snaptime('2026-01-14')) // → true  (Wednesday)
isBusinessDay(snaptime('2026-01-16')) // → true  (Friday)

// Weekends → false:
isBusinessDay(snaptime('2026-01-17')) // → false (Saturday)
isBusinessDay(snaptime('2026-01-18')) // → false (Sunday)

// With holidays  weekday on a holiday returns false:
const usHolidays = getHolidays('US', 2026)
isBusinessDay(snaptime('2026-01-01'), usHolidays) // → false (New Year's Day, Thursday)
isBusinessDay(snaptime('2026-01-15'), usHolidays) // → true  (not a US holiday)

// Without holidays, weekday holidays return true:
isBusinessDay(snaptime('2026-01-01'))             // → true (Thursday, no holiday check)
```

---

## addBusinessDays

```typescript
import { addBusinessDays } from '@anil-labs/snaptime'

// n=0 → same date:
addBusinessDays(snaptime('2026-01-15'), 0).format('YYYY-MM-DD')
// → "2026-01-15"

// Simple forward:
addBusinessDays(snaptime('2026-01-12'), 1).format('YYYY-MM-DD')
// → "2026-01-13" (Mon → Tue)

// Skips weekends:
addBusinessDays(snaptime('2026-01-12'), 5).format('YYYY-MM-DD')
// → "2026-01-19" (Mon + 5 biz days → next Mon)

addBusinessDays(snaptime('2026-01-15'), 2).format('YYYY-MM-DD')
// → "2026-01-19" (Thu + 2 → Fri → skip weekend → Mon)

addBusinessDays(snaptime('2026-01-16'), 1).format('YYYY-MM-DD')
// → "2026-01-19" (Fri + 1 → Mon)

// Negative → go backwards:
addBusinessDays(snaptime('2026-01-12'), -1).format('YYYY-MM-DD')
// → "2026-01-09" (Mon → prev Fri)

addBusinessDays(snaptime('2026-01-12'), -5).format('YYYY-MM-DD')
// → "2026-01-05" (Mon − 5 biz days → prev Mon)

// Skips over holidays:
addBusinessDays(snaptime('2026-01-16'), 1, ['2026-01-19']).format('YYYY-MM-DD')
// → "2026-01-20" (Fri + 1, Mon is holiday → Tue)
```

---

## subtractBusinessDays

```typescript
import { subtractBusinessDays } from '@anil-labs/snaptime'

subtractBusinessDays(snaptime('2026-01-12'), 1).format('YYYY-MM-DD')
// → "2026-01-09" (same as addBusinessDays(date, -1))

subtractBusinessDays(snaptime('2026-01-14'), 3).format('YYYY-MM-DD')
// → "2026-01-09" (Wed − 3 → Fri)
```

---

## nextBusinessDay / prevBusinessDay

```typescript
import { nextBusinessDay, prevBusinessDay } from '@anil-labs/snaptime'

// Next from weekday:
nextBusinessDay(snaptime('2026-01-16')).format('YYYY-MM-DD')
// → "2026-01-19" (Fri → Mon)

// Next from weekend:
nextBusinessDay(snaptime('2026-01-17')).format('YYYY-MM-DD')
// → "2026-01-19" (Sat → Mon)

nextBusinessDay(snaptime('2026-01-18')).format('YYYY-MM-DD')
// → "2026-01-19" (Sun → Mon)

// With holiday:
nextBusinessDay(snaptime('2026-01-18'), ['2026-01-19']).format('YYYY-MM-DD')
// → "2026-01-20" (Sun, Mon is holiday → Tue)

// Previous:
prevBusinessDay(snaptime('2026-01-12')).format('YYYY-MM-DD')
// → "2026-01-09" (Mon → prev Fri)

prevBusinessDay(snaptime('2026-01-17')).format('YYYY-MM-DD')
// → "2026-01-16" (Sat → Fri)

prevBusinessDay(snaptime('2026-01-18')).format('YYYY-MM-DD')
// → "2026-01-16" (Sun → Fri)
```

---

## businessDaysBetween

```typescript
import { businessDaysBetween } from '@anil-labs/snaptime'

// Same date → 0:
businessDaysBetween(snaptime('2026-01-15'), snaptime('2026-01-15'))
// → 0

// Mon to Fri (exclusive of endpoints):
businessDaysBetween(snaptime('2026-01-12'), snaptime('2026-01-16'))
// → 3 (Tue, Wed, Thu)

// Mon to Mon next week:
businessDaysBetween(snaptime('2026-01-12'), snaptime('2026-01-19'))
// → 4 (Tue, Wed, Thu, Fri  skips weekend)

// End < start → negative:
businessDaysBetween(snaptime('2026-01-16'), snaptime('2026-01-12'))
// → -3

// With holidays:
businessDaysBetween(snaptime('2026-01-12'), snaptime('2026-01-16'), ['2026-01-14'])
// → 2 (Wed is holiday, only Tue and Thu)
```

---

## getHolidays

```typescript
import { getHolidays } from '@anil-labs/snaptime'

const usHolidays = getHolidays('US', 2026)
// → array of "YYYY-MM-DD" strings

// US holidays include:
usHolidays.includes('2026-01-01') // → true  (New Year's Day)
usHolidays.includes('2026-07-04') // → true  (Independence Day)
usHolidays.includes('2026-12-25') // → true  (Christmas Day)
usHolidays.includes('2026-01-19') // → true  (MLK Day, 3rd Mon Jan)
usHolidays.includes('2026-11-26') // → true  (Thanksgiving, 4th Thu Nov)

// UK:
const ukHolidays = getHolidays('UK', 2026)
ukHolidays.includes('2026-04-03') // → true  (Good Friday)
ukHolidays.includes('2026-04-06') // → true  (Easter Monday)
ukHolidays.includes('2026-12-26') // → true  (Boxing Day)

// India:
getHolidays('IN', 2026).includes('2026-01-26') // → true (Republic Day)

// Germany:
const deHolidays = getHolidays('DE', 2026)
deHolidays.includes('2026-10-03') // → true  (German Unity Day)
deHolidays.includes('2026-04-03') // → true  (Good Friday)
deHolidays.includes('2026-04-05') // → true  (Easter Sunday)
deHolidays.includes('2026-04-06') // → true  (Easter Monday)

// France:
getHolidays('FR', 2026).includes('2026-07-14') // → true (Bastille Day)

// Canada:
getHolidays('CA', 2026).includes('2026-07-01') // → true (Canada Day)

// Australia:
const auHolidays = getHolidays('AU', 2026)
auHolidays.includes('2026-01-26') // → true  (Australia Day)
auHolidays.includes('2026-04-03') // → true  (Good Friday)
auHolidays.includes('2026-04-04') // → true  (Easter Saturday)
auHolidays.includes('2026-04-06') // → true  (Easter Monday)

// Unknown country → empty:
getHolidays('ZZ', 2026) // → []

// Case-insensitive:
getHolidays('us', 2026).includes('2026-01-01') // → true
```

### Supported Countries

| Code | Country | Holiday Count |
|:-----|:--------|:-------------|
| `US` | United States | 10 |
| `UK` | United Kingdom | 8 |
| `IN` | India | 3 |
| `DE` | Germany | 9 |
| `FR` | France | 11 |
| `CA` | Canada | 5 |
| `AU` | Australia | 8 |

Easter-based holidays are computed dynamically using the Anonymous Gregorian algorithm  dates are correct for any year.

---

## Real-World Example: Delivery Estimate

```typescript
import snaptime, { addBusinessDays, getHolidays } from '@anil-labs/snaptime'

function estimateDelivery(orderDate: string, country = 'US', processingDays = 3) {
  const order = snaptime(orderDate)
  const holidays = getHolidays(country, order.get('year'))
  const delivery = addBusinessDays(order, processingDays, holidays)

  return {
    ordered: order.format('ddd, MMM D'),
    estimated: delivery.format('ddd, MMM D'),
    processingDays,
  }
}

estimateDelivery('2026-01-16')
// → { ordered: "Fri, Jan 16", estimated: "Wed, Jan 21", processingDays: 3 }
// (Fri → Mon → Tue → Wed, Mon Jan 19 is MLK Day so skipped)
```
