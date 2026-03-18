# Real-World Recipes

Practical patterns combining D8 features.

## Age Calculator

```typescript
import d8 from '@anilkumarthakur/d8'

function calculateAge(birthdate: string) {
  const bd = d8(birthdate)
  const a = bd.age()
  return {
    years: a.years,
    months: a.months,
    days: a.days,
    display: a.toString(),
    birthday: bd.format('MMMM Do'),
  }
}

calculateAge('1995-06-15')
// → { years: 30, months: 7, days: 0, display: "30y 7mo", birthday: "June 15th" }
```

## Countdown Timer

```typescript
function getCountdown(targetDate: string) {
  const target = d8(targetDate)
  const cd = target.countdown()

  if (cd.isPast) return { status: 'passed', text: 'already passed' }

  return {
    status: 'active',
    text: cd.humanize(),
    formatted: cd.format('DD:HH:mm:ss'),
    days: cd.days,
  }
}

getCountdown('2026-12-25')
// → { status: "active", text: "344 days, ...", formatted: "344:...", days: 344 }

getCountdown('2020-01-01')
// → { status: "passed", text: "already passed" }
```

## Payroll Period

```typescript
import { DateRange } from '@anilkumarthakur/d8'

function getPayrollPeriod(date: string) {
  const d = d8(date)
  const day = d.get('date')

  const start = day <= 15
    ? d.startOf('month')
    : d.set('date', 16)

  const end = day <= 15
    ? d.set('date', 15).endOf('day')
    : d.endOf('month')

  const range = new DateRange(start, end)

  return {
    period: range.humanize(),
    workdays: range.duration().toDays(),
  }
}

getPayrollPeriod('2026-01-10')
// → { period: "Jan 1 – Jan 15, 2026", workdays: 14 }
```

## Multi-Timezone Clock

```typescript
import { Timezone } from '@anilkumarthakur/d8'

function worldClock() {
  const now = d8()
  const zones = [
    { city: 'New York',  tz: new Timezone('America/New_York') },
    { city: 'London',    tz: new Timezone('Europe/London') },
    { city: 'Mumbai',    tz: new Timezone('Asia/Kolkata') },
    { city: 'Tokyo',     tz: new Timezone('Asia/Tokyo') },
  ]

  return zones.map(z => ({
    city: z.city,
    time: z.tz.format(now, 'hh:mm A'),
    offset: z.tz.offsetString(now),
    isDST: z.tz.isDST(now),
  }))
}

// worldClock()
// → [{ city: "New York", time: "07:00 AM", offset: "-05:00", isDST: false }, ...]
```

## SLA Timer

```typescript
import { addBusinessDays, isBusinessDay, getHolidays } from '@anilkumarthakur/d8'

function calculateSLA(ticket: string, hours: number, country = 'US') {
  const created = d8(ticket)
  const year = created.get('year')
  const holidays = getHolidays(country, year)

  // Convert hours to business days
  const bizDays = Math.ceil(hours / 8)
  const deadline = addBusinessDays(created, bizDays, holidays)

  return {
    created: created.format('ddd, MMM D'),
    deadline: deadline.format('ddd, MMM D'),
    hours,
    businessDays: bizDays,
  }
}

calculateSLA('2026-01-15', 24)
// → { created: "Thu, Jan 15", deadline: "Tue, Jan 20", hours: 24, businessDays: 3 }
```

## Date Sequence Generator

```typescript
import { DateRange, DateCollection } from '@anilkumarthakur/d8'

function generateMeetingDates(start: string, end: string, dayOfWeek: number) {
  const range = new DateRange(start, end)
  const allDates = range.toArray('day')
  const c = new DateCollection(allDates)

  const meetings = c.filter(d => d.get('day') === dayOfWeek)

  return {
    count: meetings.count(),
    dates: meetings.toArray().map(d => d.format('YYYY-MM-DD')),
    first: meetings.first().format('ddd, MMM D'),
    last: meetings.last().format('ddd, MMM D'),
  }
}

// All Mondays in January 2026:
generateMeetingDates('2026-01-01', '2026-01-31', 1)
// → { count: 4, dates: ["2026-01-05","2026-01-12","2026-01-19","2026-01-26"],
//     first: "Mon, Jan 5", last: "Mon, Jan 26" }
```

## Invoice Due Date

```typescript
function invoiceDueDate(invoiceDate: string, terms: number, country = 'US') {
  const invoice = d8(invoiceDate)
  const holidays = getHolidays(country, invoice.get('year'))
  const due = addBusinessDays(invoice, terms, holidays)

  return {
    invoice: invoice.format('YYYY-MM-DD'),
    due: due.format('YYYY-MM-DD'),
    terms: `Net ${terms}`,
    isWeekend: due.isWeekend(),
  }
}

invoiceDueDate('2026-01-12', 30)
// → { invoice: "2026-01-12", due: "2026-02-23", terms: "Net 30", isWeekend: false }
```

## Fiscal Quarter Report

```typescript
function quarterSummary(date: string, startMonth = 1) {
  const d = d8(date)
  return {
    date: d.format('YYYY-MM-DD'),
    quarter: d.fiscalQuarter({ startMonth }),
    fiscalYear: d.fiscalYear({ startMonth }),
    calendarQuarter: d.quarter(),
    dayOfYear: d.dayOfYear(),
    isoWeek: d.isoWeek(),
    isLeapYear: d.isLeapYear(),
    daysInMonth: d.daysInMonth(),
  }
}

quarterSummary('2026-04-15', 4)
// → { date: "2026-04-15", quarter: 1, fiscalYear: 2027,
//     calendarQuarter: 2, dayOfYear: 105, isoWeek: 15,
//     isLeapYear: false, daysInMonth: 30 }
```
