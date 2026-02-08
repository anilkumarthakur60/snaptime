<template>
  <div class="example">
    <h1>📅 Calendar & Scheduling Examples</h1>

    <!-- Month Calendar -->
    <section>
      <h2>Current Month Overview</h2>
      <div class="month-info">
        <div class="info-item">
          <label>Month</label>
          <value>{{ currentMonth }}</value>
        </div>
        <div class="info-item">
          <label>Days in Month</label>
          <value>{{ daysInCurrentMonth }}</value>
        </div>
        <div class="info-item">
          <label>Start of Month</label>
          <value>{{ startOfCurrentMonth }}</value>
        </div>
        <div class="info-item">
          <label>End of Month</label>
          <value>{{ endOfCurrentMonth }}</value>
        </div>
      </div>
    </section>

    <!-- Week Days -->
    <section>
      <h2>This Week</h2>
      <div class="week-days">
        <div v-for="day in weekDays" :key="day" class="day-box">
          <span class="day-name">{{ day.name }}</span>
          <span class="day-date">{{ day.date }}</span>
          <span :class="['day-type', { 'is-today': day.isToday }]">
            {{ day.isToday ? 'Today' : day.isWeekend ? 'Weekend' : 'Weekday' }}
          </span>
        </div>
      </div>
    </section>

    <!-- Event Scheduling -->
    <section>
      <h2>Upcoming Events</h2>
      <div class="events">
        <div v-for="event in upcomingEvents" :key="event.id" class="event-card">
          <div class="event-title">{{ event.title }}</div>
          <div class="event-date">{{ event.date }}</div>
          <div class="event-time">{{ event.timeLeft }}</div>
        </div>
      </div>
    </section>

    <!-- Date Range -->
    <section>
      <h2>Date Range Analysis</h2>
      <div class="range-info">
        <div class="range-item">
          <label>From</label>
          <value>{{ rangeStart }}</value>
        </div>
        <div class="range-item">
          <label>To</label>
          <value>{{ rangeEnd }}</value>
        </div>
        <div class="range-item">
          <label>Duration</label>
          <value>{{ rangeDuration }}</value>
        </div>
        <div class="range-item">
          <label>Weekdays</label>
          <value>{{ weekdaysInRange }}</value>
        </div>
      </div>
    </section>

    <!-- Holiday Check -->
    <section>
      <h2>Holiday Calendar</h2>
      <div class="holidays">
        <div v-for="holiday in holidays" :key="holiday.date" class="holiday-card">
          <div class="holiday-date">{{ holiday.date }}</div>
          <div class="holiday-name">{{ holiday.name }}</div>
          <div class="days-until">{{ holiday.daysUntil }} days away</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { dateFormat, TimeDuration } from '@anilkumarthakur/snaptime'

const now = ref<any>(dateFormat())

// Month Overview
const currentMonth = computed(() => (now.value as any).format('MMMM YYYY'))

const daysInCurrentMonth = computed(() => (now.value as any).daysInMonth().toString())

const startOfCurrentMonth = computed(() => (now.value as any).startOf('month').format('YYYY-MM-DD dddd'))

const endOfCurrentMonth = computed(() => (now.value as any).endOf('month').format('YYYY-MM-DD dddd'))

// Week Days
const weekDays = computed(() => {
  const days = []
  const startOfWeek = (now.value as any).startOf('week')

  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.add(i, 'day')
    const dayNum = date.dayOfWeek()
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    days.push({
      name: dayNames[dayNum],
      date: date.format('YYYY-MM-DD'),
      isToday: date.isSame(now.value, 'day'),
      isWeekend: dayNum === 0 || dayNum === 6
    })
  }

  return days
})

// Upcoming Events
interface Event {
  id: string
  title: string
  date: string
  dateObj: any
}

const events: Event[] = [
  {
    id: '1',
    title: 'Project Deadline',
    date: dateFormat().add(3, 'day').format('YYYY-MM-DD'),
    dateObj: dateFormat().add(3, 'day')
  },
  {
    id: '2',
    title: 'Team Meeting',
    date: dateFormat().add(1, 'day').format('YYYY-MM-DD'),
    dateObj: dateFormat().add(1, 'day')
  },
  {
    id: '3',
    title: 'Conference',
    date: dateFormat().add(14, 'day').format('YYYY-MM-DD'),
    dateObj: dateFormat().add(14, 'day')
  },
  {
    id: '4',
    title: 'Vacation',
    date: dateFormat().add(30, 'day').format('YYYY-MM-DD'),
    dateObj: dateFormat().add(30, 'day')
  }
]

const upcomingEvents = computed(() => {
  return events
    .map((event) => {
      const diff = event.dateObj.diff(now.value)
      const duration = new TimeDuration(diff)
      const days = Math.ceil(duration.asDays())

      return {
        ...event,
        timeLeft: `${days} day${days !== 1 ? 's' : ''} away`
      }
    })
    .sort((a, b) => {
      const aDay = parseInt(a.timeLeft)
      const bDay = parseInt(b.timeLeft)
      return aDay - bDay
    })
})

// Date Range
const rangeStart = computed(() => now.value.startOf('month').format('YYYY-MM-DD'))

const rangeEnd = computed(() => now.value.endOf('month').format('YYYY-MM-DD'))

const rangeDuration = computed(() => {
  const start = now.value.startOf('month')
  const end = now.value.endOf('month')
  return `${end.diff(start, 'day')} days`
})

const weekdaysInRange = computed(() => {
  const start = now.value.startOf('month')
  const end = now.value.endOf('month')
  let weekdays = 0

  let current = start.clone()
  while (current.isBefore(end) || current.isSame(end)) {
    const day = current.dayOfWeek()
    if (day !== 0 && day !== 6) {
      weekdays++
    }
    current = current.add(1, 'day')
  }

  return weekdays
})

// Holidays
const holidays = computed(() => {
  const year = now.value.year()
  const holidays_list = [
    {
      date: dateFormat(`${year}-01-01`),
      name: '🎉 New Year'
    },
    {
      date: dateFormat(`${year}-12-25`),
      name: '🎄 Christmas'
    },
    {
      date: dateFormat(`${year}-07-04`),
      name: '🎆 Independence Day'
    },
    {
      date: dateFormat(`${year}-02-14`),
      name: "❤️ Valentine's Day"
    }
  ]

  return holidays_list
    .map((holiday) => {
      const diff = holiday.date.diff(now.value, 'day')

      return {
        date: holiday.date.format('YYYY-MM-DD'),
        name: holiday.name,
        daysUntil: Math.abs(diff)
      }
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
})
</script>

<style scoped>
.example {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  border-bottom: 3px solid #667eea;
  padding-bottom: 0.5rem;
}

label {
  display: block;
  font-weight: 600;
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

value {
  display: block;
  color: #333;
  font-size: 1.1rem;
  font-family: 'Courier New', monospace;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
}

/* Month Info */
.month-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item,
.range-item {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

/* Week Days */
.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
}

.day-box {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 6px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.day-box.is-today {
  border-color: #667eea;
  background: #f0f0ff;
}

.day-name {
  display: block;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.day-date {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin: 0.25rem 0;
  font-family: 'Courier New', monospace;
}

.day-type {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #ddd;
  border-radius: 3px;
  color: #555;
  margin-top: 0.25rem;
}

.day-type.is-today {
  background: #667eea;
  color: white;
}

/* Events */
.events {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.event-card {
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #667eea;
  transition: transform 0.2s;
}

.event-card:hover {
  transform: translateY(-2px);
}

.event-title {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.event-date {
  font-size: 0.9rem;
  color: #666;
  font-family: 'Courier New', monospace;
  margin-bottom: 0.25rem;
}

.event-time {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 600;
}

/* Range Info */
.range-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}

/* Holidays */
.holidays {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.holiday-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  text-align: center;
}

.holiday-date {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
  font-family: 'Courier New', monospace;
}

.holiday-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.days-until {
  font-size: 0.85rem;
  opacity: 0.85;
}

@media (max-width: 768px) {
  .week-days {
    grid-template-columns: repeat(4, 1fr);
  }

  .month-info,
  .range-info {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
