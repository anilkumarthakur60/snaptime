# Real-World Recipes

Practical patterns for common date/time challenges.

## Age Calculator

```typescript
import d8 from '@anilkumarthakur/d8'

function calculateAge(birthday: string) {
  const dob = d8(birthday)
  const age = dob.age()
  
  return {
    display: age.toString(),              // "35y 9mo 3d"
    years: age.years,
    nextBirthday: (() => {
      const thisYear = d8().get('year')
      let next = dob.set('year', thisYear)
      if (next.isBefore(d8())) {
        next = next.add(1, 'year')
      }
      return next.countdown().humanize()
    })(),
  }
}

calculateAge('1990-06-15')
// { display: "35y 9mo 3d", years: 35, nextBirthday: "89 days" }
```

## Event Countdown Widget

```typescript
import d8 from '@anilkumarthakur/d8'

function countdownDisplay(eventDate: string, eventName: string) {
  const event = d8(eventDate)
  const cd = event.countdown()
  
  if (cd.isPast) {
    return `${eventName} has passed!`
  }
  
  return `${eventName}: ${cd.format('DD days, HH:mm:ss')}`
}

countdownDisplay('2026-12-25', '🎄 Christmas')
// "🎄 Christmas: 282 days, 15:30:00"

countdownDisplay('2027-01-01', '🎆 New Year')
// "🎆 New Year: 289 days, 15:30:00"
```

## Calendar Grid Component

```typescript
import d8 from '@anilkumarthakur/d8'

function renderCalendar(monthStr: string) {
  const date = d8(monthStr)
  const grid = date.calendarGrid({ weekStart: 'monday' })
  
  console.log(date.format('MMMM YYYY'))
  console.log('Mo Tu We Th Fr Sa Su')
  
  for (const week of grid) {
    const row = week.map(cell => {
      const day = cell.date.format('DD')
      if (!cell.isCurrentMonth) return '  '
      if (cell.isToday) return `[${day}]`
      return ` ${day}`
    }).join(' ')
    console.log(row)
  }
}

renderCalendar('2026-03-01')
```

## Fiscal Year Report Periods

```typescript
import d8 from '@anilkumarthakur/d8'

function fiscalPeriods(year: number, startMonth = 4) {
  const config = { startMonth }
  const quarters = []
  
  for (let q = 0; q < 4; q++) {
    const monthOffset = q * 3
    const startDate = d8(new Date(year, startMonth - 1 + monthOffset, 1))
    const endDate = startDate.add(3, 'month').subtract(1, 'day')
    
    quarters.push({
      label: `FY${startDate.fiscalYear(config)} Q${q + 1}`,
      start: startDate.format('MMM D, YYYY'),
      end: endDate.format('MMM D, YYYY'),
    })
  }
  
  return quarters
}

fiscalPeriods(2026)
// [
//   { label: "FY2027 Q1", start: "Apr 1, 2026", end: "Jun 30, 2026" },
//   { label: "FY2027 Q2", start: "Jul 1, 2026", end: "Sep 30, 2026" },
//   { label: "FY2027 Q3", start: "Oct 1, 2026", end: "Dec 31, 2026" },
//   { label: "FY2027 Q4", start: "Jan 1, 2027", end: "Mar 31, 2027" },
// ]
```

## Payroll Date Calculator

```typescript
import d8 from '@anilkumarthakur/d8'

function payrollDates(year: number, country = 'US') {
  const holidays = d8.business.getHolidays(country, year)
  const dates = []
  
  for (let month = 1; month <= 12; month++) {
    // Payroll on 15th and last day of month
    const mid = d8(`${year}-${String(month).padStart(2, '0')}-15`)
    const last = d8.natural(`last day of ${mid.format('MMMM')} ${year}`)
    
    // If it falls on weekend/holiday, use previous business day
    const adjustedMid = d8.business.isBusinessDay(mid, holidays)
      ? mid
      : d8.business.prevBusinessDay(mid, holidays)
    
    const adjustedLast = d8.business.isBusinessDay(last, holidays)
      ? last
      : d8.business.prevBusinessDay(last, holidays)
    
    dates.push({
      month: mid.format('MMMM'),
      midMonth: adjustedMid.format('MMM D (ddd)'),
      endMonth: adjustedLast.format('MMM D (ddd)'),
    })
  }
  
  return dates
}
```

## World Clock Dashboard

```typescript
import d8, { Timezone } from '@anilkumarthakur/d8'

function worldClock() {
  const now = d8()
  
  const cities = [
    { name: '🇺🇸 New York',     tz: new Timezone('America/New_York') },
    { name: '🇬🇧 London',       tz: new Timezone('Europe/London') },
    { name: '🇩🇪 Berlin',       tz: new Timezone('Europe/Berlin') },
    { name: '🇮🇳 Mumbai',       tz: new Timezone('Asia/Kolkata') },
    { name: '🇯🇵 Tokyo',        tz: new Timezone('Asia/Tokyo') },
    { name: '🇦🇺 Sydney',       tz: new Timezone('Australia/Sydney') },
  ]
  
  return cities.map(city => ({
    city: city.name,
    time: city.tz.format(now, 'hh:mm A'),
    date: city.tz.format(now, 'MMM D'),
    offset: city.tz.offsetString(now),
    dst: city.tz.isDST(now) ? '☀️ DST' : '',
  }))
}
```

## SLA Timer

```typescript
import d8 from '@anilkumarthakur/d8'

function slaStatus(createdAt: string, slaDays: number, country = 'US') {
  const created = d8(createdAt)
  const holidays = d8.business.getHolidays(country, created.get('year'))
  const deadline = d8.business.addBusinessDays(created, slaDays, holidays)
  
  const now = d8()
  const remaining = d8.business.businessDaysBetween(now, deadline, holidays)
  
  return {
    created: created.format('MMM D, YYYY'),
    deadline: deadline.format('MMM D, YYYY'),
    remainingDays: remaining,
    status: remaining > 2 ? '🟢 On track' :
            remaining > 0 ? '🟡 At risk' :
            remaining === 0 ? '🟠 Due today' : '🔴 Overdue',
    humanized: deadline.countdown().humanize(),
  }
}

slaStatus('2026-03-16', 5)
// { created: "Mar 16, 2026", deadline: "Mar 23, 2026",
//   remainingDays: 3, status: "🟡 At risk", humanized: "5 days" }
```

## ISO Week Report

```typescript
import d8 from '@anilkumarthakur/d8'

function weekReport(dateStr: string) {
  const date = d8(dateStr)
  
  return {
    isoWeek: date.isoWeek(),
    isoYear: date.isoWeekYear(),
    label: date.format('YYYY-[W]WW'),
    weekStart: date.startOf('week').format('MMM D'),
    weekEnd: date.endOf('week').format('MMM D'),
    dayOfYear: date.dayOfYear(),
    weeksInYear: date.weeksInYear(),
    quarter: date.quarter(),
  }
}

weekReport('2026-03-18')
// { isoWeek: 12, isoYear: 2026, label: "2026-W12",
//   weekStart: "Mar 15", weekEnd: "Mar 21",
//   dayOfYear: 77, weeksInYear: 53, quarter: 1 }
```
