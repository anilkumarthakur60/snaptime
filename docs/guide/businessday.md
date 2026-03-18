# Business Days

D8 includes functions for working with business days — skip weekends and public holidays, add/subtract business days, and count working days between dates.

## Checking Business Days

```typescript
import d8, { isBusinessDay } from '@anilkumarthakur/d8'

const monday = d8('2026-03-16')    // Monday
const saturday = d8('2026-03-21')  // Saturday

isBusinessDay(monday)    // true
isBusinessDay(saturday)  // false

// Or via the factory
d8.business.isBusinessDay(monday)    // true
d8.business.isBusinessDay(saturday)  // false
```

### With Holidays

```typescript
const christmas = d8('2026-12-25')  // Friday
const holidays = ['2026-12-25']

isBusinessDay(christmas)             // true  (it's a Friday)
isBusinessDay(christmas, holidays)   // false (it's a holiday)
```

## Adding/Subtracting Business Days

### `addBusinessDays(date, n, holidays?)`

Skip weekends (and optionally holidays) when adding days:

```typescript
import d8 from '@anilkumarthakur/d8'

const friday = d8('2026-03-20')  // Friday

d8.business.addBusinessDays(friday, 1)
// Monday 2026-03-23 (skips Sat & Sun)

d8.business.addBusinessDays(friday, 5)
// Friday 2026-03-27

// Negative values go backwards
d8.business.addBusinessDays(friday, -1)
// Thursday 2026-03-19
```

### `subtractBusinessDays(date, n, holidays?)`

```typescript
const monday = d8('2026-03-23')
d8.business.subtractBusinessDays(monday, 1)
// Friday 2026-03-20
```

## Next / Previous Business Day

```typescript
const friday = d8('2026-03-20')

d8.business.nextBusinessDay(friday)   // Monday 2026-03-23
d8.business.prevBusinessDay(friday)   // Thursday 2026-03-19

const saturday = d8('2026-03-21')
d8.business.nextBusinessDay(saturday) // Monday 2026-03-23
d8.business.prevBusinessDay(saturday) // Friday 2026-03-20
```

## Counting Business Days

### `businessDaysBetween(start, end, holidays?)`

Count business days between two dates (exclusive of both endpoints):

```typescript
const start = d8('2026-03-01')
const end = d8('2026-03-31')

d8.business.businessDaysBetween(start, end)
// 21 (approximately, depends on weekday distribution)

// With holidays
const usHolidays = d8.business.getHolidays('US', 2026)
d8.business.businessDaysBetween(start, end, usHolidays)
```

## Holiday Calendars

### `getHolidays(country, year)`

Get an array of ISO date strings for public holidays:

```typescript
const holidays = d8.business.getHolidays('US', 2026)
// [
//   "2026-01-01",  // New Year's Day
//   "2026-01-19",  // MLK Day
//   "2026-02-16",  // Presidents' Day
//   "2026-05-25",  // Memorial Day
//   "2026-06-19",  // Juneteenth
//   "2026-07-04",  // Independence Day
//   "2026-09-07",  // Labor Day
//   "2026-10-12",  // Columbus Day
//   "2026-11-11",  // Veterans Day
//   "2026-11-26",  // Thanksgiving
//   "2026-12-25"   // Christmas
// ]
```

### Supported Countries

| Code | Country     | Holidays Include |
|:-----|:------------|:-----------------|
| `US` | 🇺🇸 United States | New Year, MLK, Presidents Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, Christmas |
| `UK` | 🇬🇧 United Kingdom | New Year, Good Friday, Easter Monday, Early May, Spring Bank, Summer Bank, Christmas, Boxing Day |
| `IN` | 🇮🇳 India | New Year, Republic Day, Holi, Good Friday, May Day, Independence Day, Gandhi Jayanti, Dussehra, Diwali, Children's Day, Christmas |
| `DE` | 🇩🇪 Germany | Neujahr, Heilige Drei Könige, Karfreitag, Easter, Tag der Arbeit, Christi Himmelfahrt, Pfingsten, Fronleichnam, Tag der Deutschen Einheit, Allerheiligen, Christmas |
| `FR` | 🇫🇷 France | Jour de l'an, Easter Monday, Fête du Travail, Victoire 1945, Ascension, Pentecôte, Bastille Day, Assomption, Toussaint, Armistice, Noël |
| `CA` | 🇨🇦 Canada | New Year, Family Day, Good Friday, Victoria Day, Canada Day, Labour Day, Truth & Reconciliation, Thanksgiving, Remembrance Day, Christmas, Boxing Day |
| `AU` | 🇦🇺 Australia | New Year, Australia Day, Good Friday, Easter Saturday–Monday, ANZAC Day, Queen's Birthday, Christmas, Boxing Day |

::: tip Easter-Based Holidays
Good Friday, Easter Monday, and other Easter-dependent holidays are computed dynamically using the Anonymous Gregorian algorithm — accurate for any year.
:::

## Real-World Example: Delivery Estimate

```typescript
import d8 from '@anilkumarthakur/d8'

function estimateDelivery(orderDate: string, country: string = 'US') {
  const order = d8(orderDate)
  const holidays = d8.business.getHolidays(country, order.get('year'))
  
  const processing = d8.business.addBusinessDays(order, 2, holidays)     // 2 biz days processing
  const shipping = d8.business.addBusinessDays(processing, 5, holidays)  // 5 biz days shipping
  
  return {
    ordered: order.format('MMM D, YYYY'),
    processed: processing.format('MMM D, YYYY'),
    delivered: shipping.format('MMM D, YYYY'),
  }
}

console.log(estimateDelivery('2026-12-23'))
// { ordered: "Dec 23, 2026", processed: "Dec 28, 2026", delivered: "Jan 5, 2027" }
```

## Next Steps

- [Cron Expressions](./cron) — Schedule recurring events
- [API Reference](../api/businessday) — Complete method signatures
