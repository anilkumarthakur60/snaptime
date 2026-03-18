# Date Arithmetic Examples

Common date calculations with D8.

## Adding Time

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

const date = new DateFormat('2024-01-15')

// Add days
console.log(date.add(1, 'day').format('YYYY-MM-DD')) // 2024-01-16
console.log(date.add(7, 'day').format('YYYY-MM-DD')) // 2024-01-22
console.log(date.add(30, 'day').format('YYYY-MM-DD')) // 2024-02-14

// Add other units
console.log(date.add(1, 'week').format('YYYY-MM-DD')) // 2024-01-22
console.log(date.add(1, 'month').format('YYYY-MM-DD')) // 2024-02-15
console.log(date.add(1, 'year').format('YYYY-MM-DD')) // 2025-01-15

// Add hours
const time = new DateFormat('2024-01-15T14:00:00Z')
console.log(time.add(3, 'hour').format('HH:mm')) // 17:00
console.log(time.add(90, 'minute').format('HH:mm')) // 15:30
```

## Subtracting Time

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

const date = new DateFormat('2024-01-15')

// Subtract days
console.log(date.subtract(1, 'day').format('YYYY-MM-DD')) // 2024-01-14
console.log(date.subtract(7, 'day').format('YYYY-MM-DD')) // 2024-01-08

// Subtract months
console.log(date.subtract(1, 'month').format('YYYY-MM-DD')) // 2023-12-15
console.log(date.subtract(3, 'month').format('YYYY-MM-DD')) // 2023-10-15

// Subtract years
console.log(date.subtract(1, 'year').format('YYYY-MM-DD')) // 2023-01-15
```

## Time Period Boundaries

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

const date = new DateFormat('2024-01-15T14:30:45Z')

// Start of periods
console.log(date.startOf('day').format('HH:mm:ss')) // 00:00:00
console.log(date.startOf('month').format('DD HH:mm')) // 01 00:00
console.log(date.startOf('year').format('MM-DD HH:mm')) // 01-01 00:00

// End of periods
console.log(date.endOf('day').format('HH:mm:ss')) // 23:59:59
console.log(date.endOf('month').format('DD')) // 31
console.log(date.endOf('week').format('dddd')) // Saturday
```

## Chained Operations

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

const date = new DateFormat('2024-01-15')

// Multiple operations
const result = date
  .add(1, 'week')
  .subtract(2, 'day')
  .startOf('day')
  .add(12, 'hour')

console.log(result.format('YYYY-MM-DD HH:mm:ss'))
// 2024-01-21 12:00:00

// Complex workflow
const deadline = date
  .add(30, 'day')          // 30 days from now
  .endOf('day')            // End of that day
  .subtract(2, 'hour')     // 2 hours before midnight

console.log(deadline.format('YYYY-MM-DD HH:mm'))
// 2024-02-14 22:00
```

## Calculate Differences

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

const start = new DateFormat('2024-01-01')
const end = new DateFormat('2024-01-15')

// Difference in various units
console.log(end.diff(start, 'day')) // 14
console.log(end.diff(start, 'week')) // 2
console.log(end.diff(start, 'month')) // 0 (less than 1 month)
console.log(end.diff(start, 'second')) // 1209600

// Timeline calculation
const today = new DateFormat()
const birthdate = new DateFormat('1990-05-15')

const ageInDays = today.diff(birthdate, 'day')
const ageInYears = Math.floor(ageInDays / 365.25)

console.log(`Age: ${ageInYears} years (${ageInDays} days)`)
```

## Real-World Scenarios

### Shipment Tracking

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

function calculateDeliveryDate(orderDate, shippingDays) {
  return orderDate
    .add(shippingDays, 'day')
    .add(1, 'day')  // Always add 1 day for processing
    .startOf('day')  // Normalize to start of day
}

const order = new DateFormat('2024-01-15T14:00:00')
const delivery = calculateDeliveryDate(order, 5)

console.log(`Order: ${order.format('YYYY-MM-DD')}`)
console.log(`Delivery: ${delivery.format('YYYY-MM-DD')}`)
```

### Project Timeline

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

function createProjectTimeline(startDate, phases) {
  const timeline = {}
  let currentDate = startDate.clone()

  for (const [name, days] of Object.entries(phases)) {
    const endDate = currentDate.add(days, 'day')
    timeline[name] = {
      start: currentDate.format('YYYY-MM-DD'),
      end: endDate.format('YYYY-MM-DD'),
      duration: days
    }
    currentDate = endDate.add(1, 'day')
  }

  return timeline
}

const timeline = createProjectTimeline(new DateFormat('2024-02-01'), {
  Design: 10,
  Development: 30,
  Testing: 15,
  Deployment: 5
})

console.log(timeline)
```

### Payment Schedule

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

function generatePaymentSchedule(startDate, months, amount) {
  const schedule = []
  let currentDate = startDate

  for (let i = 0; i < months; i++) {
    schedule.push({
      date: currentDate.format('YYYY-MM-DD'),
      amount: amount,
      dayOfMonth: currentDate.get('date')
    })
    currentDate = currentDate.add(1, 'month')
  }

  return schedule
}

const schedule = generatePaymentSchedule(
  new DateFormat('2024-02-15'),
  12,
  1000
)

console.log(schedule)
// Shows payment dates for 12 months starting Feb 15
```

### Subscription Renewal

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

function checkSubscriptionStatus(purchaseDate, planDuration) {
  const expiryDate = purchaseDate.add(planDuration, 'day')
  const today = new DateFormat()
  const daysLeft = expiryDate.diff(today, 'day')

  return {
    purchased: purchaseDate.format('YYYY-MM-DD'),
    expires: expiryDate.format('YYYY-MM-DD'),
    daysLeft: daysLeft,
    isActive: daysLeft > 0,
    isExpiringSoon: daysLeft > 0 && daysLeft <= 7
  }
}

const status = checkSubscriptionStatus(new DateFormat('2024-01-15'), 365)

console.log(status)
```

### Lease Duration

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

function calculateLeaseTerm(startDate, endDate) {
  const months = Math.floor(endDate.diff(startDate, 'day') / 30.44)
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  return {
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
    totalDays: endDate.diff(startDate, 'day'),
    totalMonths: months,
    years: years,
    months: remainingMonths,
    label: `${years} years and ${remainingMonths} months`
  }
}

const leaseInfo = calculateLeaseTerm(new DateFormat('2024-01-01'), new DateFormat('2027-06-30'))

console.log(leaseInfo)
```
