# BusinessDay

`BusinessDay` handles date calculations that respect business rules: weekends, holidays, and working hours.

## Constructor

```typescript
import { BusinessDay } from '@anilkumarthakur/d8'
import { DateFormat } from '@anilkumarthakur/d8'

// Create with default (Mon-Fri)
const bd = new BusinessDay()

// Create with custom working days
const bd2 = new BusinessDay({
  workingDays: [0, 1, 2, 3, 4, 5] // Sunday to Friday
})

// Create with holidays
const bd3 = new BusinessDay({
  holidays: [
    new DateFormat('2024-01-01'),
    new DateFormat('2024-07-04'),
    new DateFormat('2024-12-25')
  ]
})

// Create with both
const bd4 = new BusinessDay({
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
  holidays: [
    new DateFormat('2024-01-01'),
    new DateFormat('2024-12-25')
  ]
})
```

## Working Days

```typescript
const bd = new BusinessDay()

// Check if a date is a business day
const monday = new DateFormat('2024-01-15') // Monday
const saturday = new DateFormat('2024-01-20') // Saturday

console.log(bd.isBusinessDay(monday)) // true
console.log(bd.isBusinessDay(saturday)) // false

// Get next business day
const nextBizDay = bd.nextBusinessDay(monday)
console.log(nextBizDay.format('YYYY-MM-DD')) // 2024-01-16

// Get previous business day
const prevBizDay = bd.previousBusinessDay(nextBizDay)
console.log(prevBizDay.format('YYYY-MM-DD')) // 2024-01-15
```

## Count Business Days

```typescript
const bd = new BusinessDay()

const start = new DateFormat('2024-01-01') // Monday
const end = new DateFormat('2024-01-05') // Friday

// Count business days between dates
const count = bd.countBusinessDays(start, end)
console.log(count) // 5 (Mon, Tue, Wed, Thu, Fri)

// Another example with weekend
const start2 = new DateFormat('2024-01-12') // Friday
const end2 = new DateFormat('2024-01-15') // Monday
const count2 = bd.countBusinessDays(start2, end2)
console.log(count2) // 2 (Fri, Mon)
```

## Add/Subtract Business Days

```typescript
const bd = new BusinessDay()

// Friday
const friday = new DateFormat('2024-01-12')

// Add 3 business days (skips weekend)
const afterThree = bd.add(friday, 3)
console.log(afterThree.format('YYYY-MM-DD')) // 2024-01-17 (Wednesday)

// Subtract business days
const beforeTwo = bd.subtract(friday, 2)
console.log(beforeTwo.format('YYYY-MM-DD')) // 2024-01-10 (Wednesday)
```

## Holidays

```typescript
const bd = new BusinessDay({
  holidays: [
    new DateFormat('2024-01-01'), // New Year
    new DateFormat('2024-07-04'), // Independence Day
    new DateFormat('2024-12-25')  // Christmas
  ]
})

// Check if holiday
console.log(bd.isHoliday(new DateFormat('2024-01-01'))) // true
console.log(bd.isHoliday(new DateFormat('2024-01-02'))) // false

// Business days count with holidays
const start = new DateFormat('2024-01-01')
const end = new DateFormat('2024-01-05')
const count = bd.countBusinessDays(start, end)
// 3 days (Jan 1 is holiday, Jan 6-7 are weekend)
```

## Region-Specific Examples

```typescript
import { BusinessDay, DateFormat } from '@anilkumarthakur/d8'

// USA Business Days
const usHolidays = [
  new DateFormat('2024-01-01'), // New Year's Day
  new DateFormat('2024-01-15'), // MLK Day
  new DateFormat('2024-02-19'), // Presidents Day
  new DateFormat('2024-03-29'), // Good Friday
  new DateFormat('2024-05-27'), // Memorial Day
  new DateFormat('2024-06-19'), // Juneteenth
  new DateFormat('2024-07-04'), // Independence Day
  new DateFormat('2024-09-02'), // Labor Day
  new DateFormat('2024-11-28'), // Thanksgiving
  new DateFormat('2024-12-25')  // Christmas
]

const usBd = new BusinessDay({
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
  holidays: usHolidays
})

// UK Business Days
const ukHolidays = [
  new DateFormat('2024-01-01'), // New Year
  new DateFormat('2024-03-29'), // Good Friday
  new DateFormat('2024-04-01'), // Easter Monday
  new DateFormat('2024-05-06'), // Early May Bank Holiday
  new DateFormat('2024-05-27'), // Spring Bank Holiday
  new DateFormat('2024-08-26'), // Summer Bank Holiday
  new DateFormat('2024-12-25'), // Christmas
  new DateFormat('2024-12-26')  // Boxing Day
]

const ukBd = new BusinessDay({
  holidays: ukHolidays
})

// India Business Days (Sat-Sun + holidays)
const indiaHolidays = [
  new DateFormat('2024-01-26'), // Republic Day
  new DateFormat('2024-03-25'), // Holi
  new DateFormat('2024-04-17'), // Ram Navami
  new DateFormat('2024-05-23'), // Buddha Purnima
  new DateFormat('2024-06-17'), // Eid ul-Adha
  new DateFormat('2024-08-15'), // Independence Day
  new DateFormat('2024-09-16'), // Milad-un-Nabi
  new DateFormat('2024-10-12'), // Dussehra
  new DateFormat('2024-11-01'), // Diwali
  new DateFormat('2024-12-25')  // Christmas
]

const indiaBd = new BusinessDay({
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
  holidays: indiaHolidays
})
```

## Business Hours

```typescript
const bd = new BusinessDay({
  workingDays: [1, 2, 3, 4, 5],
  workingHours: {
    start: 9,   // 9 AM
    end: 17     // 5 PM
  }
})

// Check if within business hours
const businessTime = new DateFormat('2024-01-15T14:00:00')
console.log(bd.isBusinessHours(businessTime)) // true

const afterHours = new DateFormat('2024-01-15T18:00:00')
console.log(bd.isBusinessHours(afterHours)) // false

const weekend = new DateFormat('2024-01-20T14:00:00') // Saturday
console.log(bd.isBusinessHours(weekend)) // false
```

## Real-World Scenarios

```typescript
import { BusinessDay, DateFormat } from '@anilkumarthakur/d8'

const bd = new BusinessDay({
  holidays: [
    new DateFormat('2024-01-01'),
    new DateFormat('2024-12-25')
  ]
})

// Delivery deadline: 3 business days from now
const orderDate = new DateFormat('2024-01-12') // Friday
const deliveryDeadline = bd.add(orderDate, 3)
console.log(deliveryDeadline.format('YYYY-MM-DD')) // 2024-01-17

// Project timeline: count business days available
const projectStart = new DateFormat('2024-02-01')
const projectEnd = new DateFormat('2024-02-29')
const availableDays = bd.countBusinessDays(projectStart, projectEnd)
console.log(`Available: ${availableDays} business days`)

// Service SLA: resolve within 2 business days
const ticketCreated = new DateFormat('2024-01-19') // Friday 3 PM
const slaDeadline = bd.add(ticketCreated, 2)
console.log(`SLA Deadline: ${slaDeadline.format('YYYY-MM-DD HH:mm')}`)

// Payroll: next business day after month-end
const monthEnd = new DateFormat('2024-01-31')
const payrollDate = bd.nextBusinessDay(monthEnd)
console.log(`Payroll: ${payrollDate.format('YYYY-MM-DD')}`)
```

## Custom Working Days

```typescript
// Saturday-Sunday weekend (not Mon-Fri)
const middleEastBd = new BusinessDay({
  workingDays: [1, 2, 3, 4, 5], // Sun-Thu
  holidays: [
    // Local holidays
  ]
})

// 6-day work week
const sixDayBd = new BusinessDay({
  workingDays: [0, 1, 2, 3, 4, 5] // Sun-Fri
})
```
