# Cron Scheduling Examples

Schedule and evaluate recurring events using cron expressions.

## Basic Cron Matching

```typescript
import { Cron, DateFormat } from '@anilkumarthakur/d8'

// Daily at 9 AM
const dailyNine = new Cron('0 9 * * *')

const monday9am = new DateFormat('2024-01-15T09:00:00')
const monday3pm = new DateFormat('2024-01-15T15:00:00')

console.log(dailyNine.matches(monday9am)) // true
console.log(dailyNine.matches(monday3pm)) // false

// Every Monday at 9 AM
const mondayNine = new Cron('0 9 * * 1')
const thursday9am = new DateFormat('2024-01-18T09:00:00')

console.log(mondayNine.matches(monday9am)) // true
console.log(mondayNine.matches(thursday9am)) // false
```

## Finding Next Occurrence

```typescript
import { Cron, DateFormat } from '@anilkumarthakur/d8'

// Daily at 9 AM
const cron = new Cron('0 9 * * *')

// Find next 9 AM from current time
const now = new DateFormat('2024-01-15T14:30:00')
const nextRun = cron.next(now)

console.log(nextRun.format('YYYY-MM-DD HH:mm'))
// Output: 2024-01-16 09:00 (tomorrow)

// Next work-week event
const weekdayNine = new Cron('0 9 * * 1-5')
const nextWorkday = weekdayNine.next(new DateFormat('2024-01-19T17:00:00')) // Fri 5 PM

console.log(nextWorkday.format('dddd HH:mm')) // Monday 09:00
```

## Finding All Occurrences in Range

```typescript
import { Cron, DateFormat } from '@anilkumarthakur/d8'

// Every 2 hours
const cron = new Cron('0 */2 * * *')

const start = new DateFormat('2024-01-15 00:00:00')
const end = new DateFormat('2024-01-15 23:59:59')

const matches = cron.between(start, end)

console.log(matches.length) // 12 times (00:00, 02:00, 04:00, ..., 22:00)

for (const match of matches) {
  console.log(match.format('HH:mm'))
}
```

## Humanize Descriptions

```typescript
import { Cron } from '@anilkumarthakur/d8'

const examples = [
  { expr: '* * * * *', desc: 'Every minute' },
  { expr: '*/5 * * * *', desc: 'Every 5 minutes' },
  { expr: '0 9 * * *', desc: 'Every day at 9 AM' },
  { expr: '0 9 * * 1-5', desc: 'Weekdays at 9 AM' },
  { expr: '0 0 * * 0', desc: 'Every Sunday at midnight' },
  { expr: '0 0 1 * *', desc: 'First day of month' }
]

for (const { expr, desc } of examples) {
  const cron = new Cron(expr)
  console.log(`${expr.padEnd(15)} → ${cron.humanize()}`)
}
```

## Backup Scheduler

```typescript
import { Cron, DateFormat } from '@anilkumarthakur/d8'

function createBackupSchedule() {
  const schedules = {
    hourly: new Cron('0 * * * *'),      // Every hour
    daily: new Cron('0 2 * * *'),       // 2 AM daily
    weekly: new Cron('0 3 * * 0'),      // 3 AM Sundays
    monthly: new Cron('0 4 1 * *')      // 4 AM on 1st
  }

  return schedules
}

function getNextBackup(backupType = 'daily') {
  const schedules = createBackupSchedule()
  const cron = schedules[backupType]

  const nextRun = cron.next()
  const timeUntil = nextRun.toNow()

  return {
    type: backupType,
    nextRun: nextRun.format('YYYY-MM-DD HH:mm'),
    timeUntil: timeUntil
  }
}

console.log(getNextBackup('daily'))
```

## Task Scheduler

```typescript
import { Cron, DateFormat } from '@anilkumarthakur/d8'

class TaskScheduler {
  constructor() {
    this.tasks = []
  }

  addTask(name, cronExpression, handler) {
    this.tasks.push({
      name,
      cron: new Cron(cronExpression),
      handler
    })
  }

  getNextRun(taskName) {
    const task = this.tasks.find(t => t.name === taskName)
    if (!task) return null

    return task.cron.next()
  }

  checkAndExecute() {
    const now = new DateFormat()

    for (const task of this.tasks) {
      if (task.cron.matches(now)) {
        console.log(`Executing: ${task.name}`)
        task.handler()
      }
    }
  }

  getScheduleSummary() {
    return this.tasks.map(task => ({
      name: task.name,
      schedule: task.cron.toString(),
      description: task.cron.humanize(),
      nextRun: task.cron.next().format('YYYY-MM-DD HH:mm')
    }))
  }
}

// Usage
const scheduler = new TaskScheduler()

scheduler.addTask(
  'Daily Digest',
  '0 9 * * *',
  () => console.log('Sending daily digest...')
)

scheduler.addTask(
  'Weekly Report',
  '0 9 * * 1',
  () => console.log('Generating weekly report...')
)

scheduler.addTask(
  'Backup',
  '0 2 * * *',
  () => console.log('Backup running...')
)

console.log(scheduler.getScheduleSummary())
```

## Email Campaign Scheduler

```typescript
import { Cron, DateFormat } from '@anilkumarthakur/d8'

class EmailCampaign {
  constructor(name, schedule) {
    this.name = name
    this.cron = new Cron(schedule)
    this.lastRun = null
  }

  shouldRun() {
    return this.cron.matches(new DateFormat())
  }

  run() {
    console.log(`Running: ${this.name}`)
    this.lastRun = new DateFormat()
  }

  getNextRun() {
    return this.cron.next()
  }

  getStatus() {
    return {
      name: this.name,
      schedule: this.cron.humanize(),
      lastRun: this.lastRun?.format('YYYY-MM-DD HH:mm') || 'Never',
      nextRun: this.getNextRun().format('YYYY-MM-DD HH:mm')
    }
  }
}

// Setup campaigns
const campaigns = [
  new EmailCampaign('Morning Newsletter', '0 8 * * 1-5'),
  new EmailCampaign('Weekend Deals', '0 10 * * 0,6'),
  new EmailCampaign('Birthday Reminder', '0 12 * * *')
]

// Check and run
for (const campaign of campaigns) {
  if (campaign.shouldRun()) {
    campaign.run()
  }
}

// Show all statuses
for (const campaign of campaigns) {
  console.log(campaign.getStatus())
}
```

## Monitoring and Maintenance

```typescript
import { Cron, DateFormat } from '@anilkumarthakur/d8'

const maintenanceTasks = {
  'Clear Cache': '0 3 * * 0',           // 3 AM Sunday
  'Optimize DB': '0 2 * * 6',           // 2 AM Saturday
  'Update SSL': '0 4 1 * *',            // 4 AM 1st of month
  'Purge Logs': '0 1 * * 0',            // 1 AM Sunday
  'Health Check': '*/30 * * * *'        // Every 30 minutes
}

function showMaintenanceSchedule() {
  console.log('Maintenance Schedule:')
  console.log('=====================')

  for (const [task, schedule] of Object.entries(maintenanceTasks)) {
    const cron = new Cron(schedule)
    const nextRun = cron.next()

    console.log(`\n${task}`)
    console.log(`  Schedule: ${cron.humanize()}`)
    console.log(`  Next Run: ${nextRun.format('YYYY-MM-DD HH:mm')}`)
    console.log(`  In ${nextRun.toNow()}`)
  }
}

showMaintenanceSchedule()
```

## Reminder System

```typescript
import { Cron, DateFormat } from '@anilkumarthakur/d8'

class ReminderSystem {
  createReminder(description, cronExpression) {
    const cron = new Cron(cronExpression)
    const nextRun = cron.next()

    return {
      description,
      schedule: cronExpression,
      humanized: cron.humanize(),
      nextRun: nextRun.format('YYYY-MM-DD HH:mm'),
      daysUntilNext: nextRun.diff(new DateFormat(), 'day')
    }
  }

  createDailyReminder(time, description) {
    const [hour, minute] = time.split(':').map(Number)
    const expr = `${minute} ${hour} * * *`
    return this.createReminder(description, expr)
  }

  createWeeklyReminder(day, time, description) {
    const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    const [hour, minute] = time.split(':').map(Number)
    const expr = `${minute} ${hour} * * ${days[day]}`
    return this.createReminder(description, expr)
  }
}

const reminders = new ReminderSystem()

console.log(reminders.createDailyReminder('09:00', 'Stand-up meeting'))
console.log(reminders.createWeeklyReminder('Mon', '14:00', 'Team sync'))
```
