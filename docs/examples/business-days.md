# Business Days Examples

Calculate with business calendars, skip weekends and holidays.

## Basic Business Day Operations

```typescript
import { BusinessDay, DateFormat } from '@anilkumarthakur/d8'

const bd = new BusinessDay()

// Create dates
const friday = new DateFormat('2024-01-12')
const monday = new DateFormat('2024-01-15')
const saturday = new DateFormat('2024-01-20')

// Check if business day
console.log(bd.isBusinessDay(friday))  // true
console.log(bd.isBusinessDay(monday))  // true
console.log(bd.isBusinessDay(saturday)) // false

// Get next business day
console.log(bd.nextBusinessDay(friday).format('ddd DD')) // Mon 15

// Get previous business day
console.log(bd.previousBusinessDay(monday).format('ddd DD')) // Fri 12
```

## Count Business Days

```typescript
import { BusinessDay, DateFormat } from '@anilkumarthakur/d8'

const bd = new BusinessDay()

// Full work week
const start = new DateFormat('2024-01-15') // Monday
const end = new DateFormat('2024-01-19')   // Friday

console.log(bd.countBusinessDays(start, end)) // 5

// Across weekend
const start2 = new DateFormat('2024-01-12') // Friday
const end2 = new DateFormat('2024-01-15')   // Monday

console.log(bd.countBusinessDays(start2, end2)) // 2 (Fri, Mon)
```

## Add Business Days

```typescript
import { BusinessDay, DateFormat } from '@anilkumarthakur/d8'

const bd = new BusinessDay()

// Friday
const friday = new DateFormat('2024-01-12')

// Add business days (skips weekend)
console.log(bd.add(friday, 1).format('dddd DD')) // Monday 15
console.log(bd.add(friday, 5).format('dddd DD')) // Friday 19
console.log(bd.add(friday, 10).format('dddd DD')) // Friday 02 (next week)

// From Monday
const monday = new DateFormat('2024-01-15')
console.log(bd.add(monday, 5).format('dddd DD')) // Friday 19

// Subtract
console.log(bd.subtract(monday, 3).format('dddd DD')) // Wednesday 10
```

## Holidays

```typescript
import { BusinessDay, DateFormat } from '@anilkumarthakur/d8'

const holidays = [
  new DateFormat('2024-01-01'),  // New Year
  new DateFormat('2024-07-04'),  // Independence Day
  new DateFormat('2024-12-25')   // Christmas
]

const bd = new BusinessDay({ holidays })

// Check if holiday
console.log(bd.isHoliday(new DateFormat('2024-01-01'))) // true
console.log(bd.isHoliday(new DateFormat('2024-01-15'))) // false

// Add with holiday adjustment
const date = new DateFormat('2024-12-24') // Dec 24 (Tue before Xmas)
console.log(bd.add(date, 3).format('YYYY-MM-DD')) // Skips Xmas
```

## Regional Business Days

### US Holidays

```typescript
import { BusinessDay, DateFormat } from '@anilkumarthakur/d8'

const usHolidays2024 = [
  new DateFormat('2024-01-01'),  // New Year's Day
  new DateFormat('2024-01-15'),  // MLK Day
  new DateFormat('2024-02-19'),  // Presidents' Day
  new DateFormat('2024-03-29'),  // Good Friday
  new DateFormat('2024-05-27'),  // Memorial Day
  new DateFormat('2024-06-19'),  // Juneteenth
  new DateFormat('2024-07-04'),  // Independence Day
  new DateFormat('2024-09-02'),  // Labor Day
  new DateFormat('2024-11-28'),  // Thanksgiving
  new DateFormat('2024-12-25')   // Christmas
]

const usBd = new BusinessDay({
  workingDays: [1, 2, 3, 4, 5],
  holidays: usHolidays2024
})

const date = new DateFormat('2024-01-01') // New Year (holiday)
const nextBiz = usBd.nextBusinessDay(date)
console.log(nextBiz.format('YYYY-MM-DD')) // 2024-01-02
```

### India Holidays

```typescript
import { BusinessDay, DateFormat } from '@anilkumarthakur/d8'

const indiaHolidays2024 = [
  new DateFormat('2024-01-26'),  // Republic Day
  new DateFormat('2024-03-25'),  // Holi
  new DateFormat('2024-04-17'),  // Ram Navami
  new DateFormat('2024-08-15'),  // Independence Day
  new DateFormat('2024-10-12'),  // Dussehra
  new DateFormat('2024-11-01'),  // Diwali
  new DateFormat('2024-12-25')   // Christmas
]

const indiaBd = new BusinessDay({
  workingDays: [1, 2, 3, 4, 5],
  holidays: indiaHolidays2024
})
```

## Real-World Use Cases

### Delivery Estimate

```typescript
import { BusinessDay, DateFormat } from '@anilkumarthakur/d8'

const bd = new BusinessDay()

function calculateDeliveryDate(orderDate, businessDays) {
  let current = orderDate
  let count = 0

  while (count < businessDays) {
    current = current.add(1, 'day')
    if (bd.isBusinessDay(current)) {
      count++
    }
  }

  return current
}

const order = new DateFormat('2024-01-12') // Friday
const delivery = calculateDeliveryDate(order, 3)

console.log(`Order: ${order.format('dddd DD')}`)
console.log(`Delivery: ${delivery.format('dddd DD')}`) // Wednesday 17 (3 business days)
```

### Invoice SLA

```typescript
import { BusinessDay, DateFormat } from '@anilkumarthakur/d8'

function calculatePaymentDeadline(invoiceDate, daysDue = 2) {
  const bd = new BusinessDay()
  const dueDate = bd.add(invoiceDate, daysDue)

  return {
    invoiceDate: invoiceDate.format('YYYY-MM-DD'),
    dueDate: dueDate.format('YYYY-MM-DD'),
    daysUntilDue: dueDate.diff(new DateFormat(), 'day'),
    businessDaysUntilDue: bd.countBusinessDays(new DateFormat(), dueDate)
  }
}

const invoice = new DateFormat('2024-01-15')
const terms = calculatePaymentDeadline(invoice, 5)

console.log(terms)
```

### Working Hours

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

function isWithinWorkingHours(date, startHour = 9, endHour = 17) {
  const hour = date.get('hour')
  const day = date.get('day')

  // Check day is Mon-Fri
  if (day === 0 || day === 6) return false

  // Check hour is within range
  return hour >= startHour && hour < endHour
}

const workTime = new DateFormat('2024-01-15T14:00:00') // Monday 2 PM
const afterHours = new DateFormat('2024-01-15T18:00:00') // Monday 6 PM
const weekend = new DateFormat('2024-01-20T14:00:00') // Saturday 2 PM

console.log(isWithinWorkingHours(workTime)) // true
console.log(isWithinWorkingHours(afterHours)) // false
console.log(isWithinWorkingHours(weekend)) // false
```

### Support SLA

```typescript
import { BusinessDay, DateFormat } from '@anilkumarthakur/d8'

class SupportTicket {
  constructor(createdAt, severity = 'medium') {
    this.createdAt = createdAt
    this.severity = severity
    this.bd = new BusinessDay()
  }

  getSLA() {
    const slaHours = {
      critical: 1,
      high: 4,
      medium: 8,
      low: 24
    }

    return slaHours[this.severity]
  }

  getDeadline() {
    const slaHours = this.getSLA()
    const deadline = this.createdAt.add(slaHours, 'hour')

    // Adjust if falls outside working hours
    const hour = deadline.get('hour')
    const day = deadline.get('day')

    if (hour >= 17) {
      // After 5 PM, move to next business day 9 AM
      return deadline
        .add(1, 'day')
        .startOf('day')
        .set('hour', 9)
    }

    return deadline
  }

  isOverdue() {
    return new DateFormat().isAfter(this.getDeadline())
  }
}

const ticket = new SupportTicket(
  new DateFormat('2024-01-15T14:00:00'),
  'high'
)

console.log(`SLA: ${ticket.getSLA()} hours`)
console.log(`Deadline: ${ticket.getDeadline().format('YYYY-MM-DD HH:mm')}`)
console.log(`Overdue: ${ticket.isOverdue()}`)
```

### Report Generation

```typescript
import { BusinessDay, DateCollection, DateFormat } from '@anilkumarthakur/d8'

function weeklyReport(startDate) {
  const bd = new BusinessDay()
  const dates = new DateCollection([])

  let current = startDate

  // Get 5 business days
  for (let i = 0; i < 5; i++) {
    if (bd.isBusinessDay(current)) {
      // dates.push(current)
    }
    current = current.add(1, 'day')
  }

  return {
    week: `${startDate.format('YYYY-MM-DD')} to ${current.format('YYYY-MM-DD')}`,
    businessDays: bd.countBusinessDays(startDate, current),
    weekends: 2
  }
}
```
