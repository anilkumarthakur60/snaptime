<template>
  <div class="container">
    <header>
      <h1>SnapTime - Vue 3 Composition API Example</h1>
      <p>Complete TypeScript example with date/time operations</p>
    </header>

    <main>
      <!-- Current Date/Time Section -->
      <section class="section">
        <h2>📅 Current Date & Time</h2>
        <div class="info-grid">
          <div class="info-box">
            <label>Local Time</label>
            <value>{{ currentDateTime }}</value>
          </div>
          <div class="info-box">
            <label>UTC Time</label>
            <value>{{ utcDateTime }}</value>
          </div>
          <div class="info-box">
            <label>ISO Format</label>
            <value>{{ isoDateTime }}</value>
          </div>
          <div class="info-box">
            <label>Unix Timestamp</label>
            <value>{{ unixTimestamp }}</value>
          </div>
        </div>
      </section>

      <!-- Date Formatting Section -->
      <section class="section">
        <h2>🎨 Date Formatting</h2>
        <div class="format-grid">
          <div class="format-box">
            <label>YYYY-MM-DD</label>
            <value>{{ formattedDate }}</value>
          </div>
          <div class="format-box">
            <label>Full Format</label>
            <value>{{ fullFormat }}</value>
          </div>
          <div class="format-box">
            <label>Time Only</label>
            <value>{{ timeOnly }}</value>
          </div>
          <div class="format-box">
            <label>Custom</label>
            <value>{{ customFormat }}</value>
          </div>
        </div>
      </section>

      <!-- Date Queries Section -->
      <section class="section">
        <h2>🔍 Date Queries</h2>
        <div class="queries-grid">
          <div class="query-box">
            <label>Is Valid Date</label>
            <badge :type="isValidDate ? 'success' : 'error'">
              {{ isValidDate ? 'Yes' : 'No' }}
            </badge>
          </div>
          <div class="query-box">
            <label>Is Leap Year</label>
            <badge :type="isLeapYear ? 'success' : 'error'">
              {{ isLeapYear ? 'Yes' : 'No' }}
            </badge>
          </div>
          <div class="query-box">
            <label>Day of Week</label>
            <value>{{ dayOfWeek }}</value>
          </div>
          <div class="query-box">
            <label>Day of Year</label>
            <value>{{ dayOfYear }}</value>
          </div>
          <div class="query-box">
            <label>Days in Month</label>
            <value>{{ daysInMonth }}</value>
          </div>
          <div class="query-box">
            <label>ISO Week</label>
            <value>{{ isoWeek }}</value>
          </div>
        </div>
      </section>

      <!-- Date Comparisons Section -->
      <section class="section">
        <h2>⚖️ Date Comparisons</h2>
        <div class="comparisons-grid">
          <div class="comparison-box">
            <label>Now vs Tomorrow</label>
            <badge :type="isBeforeTomorrow ? 'success' : 'error'">
              {{ isBeforeTomorrow ? 'Before' : 'After' }}
            </badge>
          </div>
          <div class="comparison-box">
            <label>Now vs Yesterday</label>
            <badge :type="isAfterYesterday ? 'success' : 'error'">
              {{ isAfterYesterday ? 'After' : 'Before' }}
            </badge>
          </div>
          <div class="comparison-box">
            <label>Days Difference</label>
            <value>{{ daysDifference }}</value>
          </div>
          <div class="comparison-box">
            <label>Days Between</label>
            <value>{{ daysBetween }}</value>
          </div>
        </div>
      </section>

      <!-- Date Manipulation Section -->
      <section class="section">
        <h2>✏️ Date Manipulation</h2>
        <div class="manipulation-grid">
          <div class="manip-box">
            <label>Add 7 Days</label>
            <value>{{ addDays }}</value>
          </div>
          <div class="manip-box">
            <label>Add 3 Months</label>
            <value>{{ addMonths }}</value>
          </div>
          <div class="manip-box">
            <label>Add 1 Year</label>
            <value>{{ addYear }}</value>
          </div>
          <div class="manip-box">
            <label>Start of Month</label>
            <value>{{ startOfMonth }}</value>
          </div>
          <div class="manip-box">
            <label>End of Month</label>
            <value>{{ endOfMonth }}</value>
          </div>
          <div class="manip-box">
            <label>Start of Year</label>
            <value>{{ startOfYear }}</value>
          </div>
        </div>
      </section>

      <!-- Relative Time Section -->
      <section class="section">
        <h2>⏰ Relative Time</h2>
        <div class="relative-grid">
          <div class="relative-box">
            <label>From Now</label>
            <value>{{ fromNow }}</value>
          </div>
          <div class="relative-box">
            <label>5 Hours Ago</label>
            <value>{{ fiveHoursAgo }}</value>
          </div>
          <div class="relative-box">
            <label>3 Days From Now</label>
            <value>{{ threeDaysFromNow }}</value>
          </div>
          <div class="relative-box">
            <label>To Tomorrow</label>
            <value>{{ toTomorrow }}</value>
          </div>
        </div>
      </section>

      <!-- Duration Section -->
      <section class="section">
        <h2>⏱️ Duration & Time Intervals</h2>
        <div class="duration-grid">
          <div class="duration-box">
            <label>24 Hours Duration</label>
            <value>{{ duration24Hours }}</value>
          </div>
          <div class="duration-box">
            <label>Humanized (1 day)</label>
            <value>{{ durationHumanized }}</value>
          </div>
          <div class="duration-box">
            <label>In Seconds</label>
            <value>{{ durationSeconds }}</value>
          </div>
          <div class="duration-box">
            <label>In Hours</label>
            <value>{{ durationHours }}</value>
          </div>
          <div class="duration-box">
            <label>In Days</label>
            <value>{{ durationDays }}</value>
          </div>
          <div class="duration-box">
            <label>Add to Date</label>
            <value>{{ dateWithDuration }}</value>
          </div>
        </div>
      </section>

      <!-- Date Parsing Section -->
      <section class="section">
        <h2>📝 Date Parsing</h2>
        <div class="parsing-grid">
          <div class="parse-box">
            <label>Parse "2025-12-25"</label>
            <value>{{ parsedDate }}</value>
          </div>
          <div class="parse-box">
            <label>Parse with Format</label>
            <value>{{ parsedWithFormat }}</value>
          </div>
          <div class="parse-box">
            <label>Parse Unix Timestamp</label>
            <value>{{ parsedTimestamp }}</value>
          </div>
          <div class="parse-box">
            <label>Validate Parsed</label>
            <badge :type="isParsedValid ? 'success' : 'error'">
              {{ isParsedValid ? 'Valid' : 'Invalid' }}
            </badge>
          </div>
        </div>
      </section>

      <!-- Min/Max Section -->
      <section class="section">
        <h2>📊 Min & Max Dates</h2>
        <div class="minmax-grid">
          <div class="minmax-box">
            <label>Minimum Date</label>
            <value>{{ minDate }}</value>
          </div>
          <div class="minmax-box">
            <label>Maximum Date</label>
            <value>{{ maxDate }}</value>
          </div>
          <div class="minmax-box">
            <label>Days Between Min & Max</label>
            <value>{{ daysBetweenMinMax }}</value>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SnapTime, TimeDuration, dateFormat } from '@anilkumarthakur/snaptime'
import type { Unit } from '@anilkumarthakur/snaptime'

// ==================== Reactive State ====================
const now = ref<any>(dateFormat())

// ==================== Lifecycle ====================
onMounted(() => {
  // Update current time every second for demo
  setInterval(() => {
    now.value = dateFormat()
  }, 1000)
})

// ==================== Current Date/Time ====================
const currentDateTime = computed(() => now.value.format('YYYY-MM-DD HH:mm:ss'))
const utcDateTime = computed(() => now.value.utc().format('YYYY-MM-DD HH:mm:ss [UTC]'))
const isoDateTime = computed(() => now.value.toISOString())
const unixTimestamp = computed(() => now.value.unix().toString())

// ==================== Date Formatting ====================
const formattedDate = computed(() => now.value.format('YYYY-MM-DD'))
const fullFormat = computed(() => now.value.format('dddd, MMMM DD, YYYY HH:mm:ss'))
const timeOnly = computed(() => now.value.format('HH:mm:ss'))
const customFormat = computed(() => now.value.format('[Today is] dddd, [the] Do [of] MMMM'))

// ==================== Date Queries ====================
const isValidDate = computed(() => now.value.isValid())
const isLeapYear = computed(() => now.value.isLeapYear())
const dayOfWeek = computed(() => now.value.format('dddd'))
const dayOfYear = computed(() => (now.value.dayOfYear() as number).toString())
const daysInMonth = computed(() => (now.value.daysInMonth() as number).toString())
const isoWeek = computed(() => (now.value.isoWeek() as number).toString())

// ==================== Date Comparisons ====================
const tomorrow = computed(() => dateFormat().add(1, 'day'))
const yesterday = computed(() => dateFormat().subtract(1, 'day'))

const isBeforeTomorrow = computed(() => now.value.isBefore(tomorrow.value))
const isAfterYesterday = computed(() => now.value.isAfter(yesterday.value))

const daysDifference = computed(() => {
  const diff = now.value.diff(yesterday.value, 'day')
  return `${diff} day(s) since yesterday`
})

const daysBetween = computed(() => {
  const start = dateFormat('2025-01-01') as any
  const end = dateFormat('2025-12-31') as any
  const days = end.diff(start, 'day')
  return `${days} days in 2025`
})

// ==================== Date Manipulation ====================
const addDays = computed(() => now.value.add(7, 'day').format('YYYY-MM-DD'))
const addMonths = computed(() => now.value.add(3, 'month').format('YYYY-MM-DD'))
const addYear = computed(() => now.value.add(1, 'year').format('YYYY-MM-DD'))
const startOfMonth = computed(() => now.value.startOf('month').format('YYYY-MM-DD'))
const endOfMonth = computed(() => (now.value.endOf('month') as SnapTime).format('YYYY-MM-DD'))
const startOfYear = computed(() => now.value.startOf('year').format('YYYY-MM-DD'))

// ==================== Relative Time ====================
const fromNow = computed(() => now.value.fromNow())

const fiveHoursAgo = computed(() => {
  const time = (dateFormat().subtract(5, 'hour') as SnapTime)
  return time.from(dateFormat())
})

const threeDaysFromNow = computed(() => {
  const time = (dateFormat().add(3, 'day') as SnapTime)
  return time.toNow()
})

const toTomorrow = computed(() => {
  return (tomorrow.value.from(dateFormat()) as string)
})

// ==================== Duration ====================
const oneDay = computed(() => new TimeDuration(24 * 60 * 60 * 1000))

const duration24Hours = computed(() => {
  const dur = (dateFormat().diff(dateFormat().subtract(1, 'day')) as number)
  return `${dur} ms`
})

const durationHumanized = computed(() => {
  return oneDay.value.humanize(true)
})

const durationSeconds = computed(() => {
  return `${oneDay.value.asSeconds()} seconds`
})

const durationHours = computed(() => {
  return `${oneDay.value.asHours()} hours`
})

const durationDays = computed(() => {
  return `${oneDay.value.asDays()} days`
})

const dateWithDuration = computed(() => {
  const date = dateFormat().add(1, 'day')
  const duration = new TimeDuration(6 * 60 * 60 * 1000) // 6 hours
  return date.format('YYYY-MM-DD HH:mm:ss')
})

// ==================== Date Parsing ====================
const parsedDate = computed(() => {
  const parsed = (dateFormat('2025-12-25') as SnapTime)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : 'Invalid'
})

const parsedWithFormat = computed(() => {
  const parsed = (dateFormat.parse('25/12/2025', 'DD/MM/YYYY') as SnapTime)
  return parsed.format('YYYY-MM-DD')
})

const parsedTimestamp = computed(() => {
  const parsed = dateFormat(1640995200000) // 2021-12-31
  return parsed.format('YYYY-MM-DD')
})

const isParsedValid = computed(() => {
  return dateFormat('2025-12-25').isValid()
})

// ==================== Min & Max ====================
const dates = computed(() => [
  dateFormat('2025-01-15'),
  dateFormat('2025-06-20'),
  dateFormat('2025-12-10')
])

const minDate = computed(() => {
  const min = dateFormat.min(...dates.value) as SnapTime
  return min.format('YYYY-MM-DD')
})

const maxDate = computed(() => {
  const max = dateFormat.max(...dates.value) as SnapTime
  return max.format('YYYY-MM-DD')
})

const daysBetweenMinMax = computed(() => {
  const min = dateFormat.min(...dates.value) as SnapTime
  const max = dateFormat.max(...dates.value) as SnapTime
  return `${max.diff(min, 'day')} days`
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

header {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.section h2 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  border-bottom: 3px solid #667eea;
  padding-bottom: 0.5rem;
}

/* Grid Layouts */
.info-grid,
.format-grid,
.queries-grid,
.comparisons-grid,
.manipulation-grid,
.relative-grid,
.duration-grid,
.parsing-grid,
.minmax-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-box,
.format-box,
.query-box,
.comparison-box,
.manip-box,
.relative-box,
.duration-box,
.parse-box,
.minmax-box {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.info-box:hover,
.format-box:hover,
.query-box:hover,
.comparison-box:hover,
.manip-box:hover,
.relative-box:hover,
.duration-box:hover,
.parse-box:hover,
.minmax-box:hover {
  border-color: #667eea;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
}

value {
  display: block;
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
  word-break: break-word;
  font-family: 'Courier New', monospace;
  background: white;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 4px solid #667eea;
}

badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

badge[type='success'] {
  background: #d4edda;
  color: #155724;
}

badge[type='error'] {
  background: #f8d7da;
  color: #721c24;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  header h1 {
    font-size: 1.8rem;
  }

  .section {
    padding: 1.5rem;
  }

  .info-grid,
  .format-grid,
  .queries-grid,
  .comparisons-grid,
  .manipulation-grid,
  .relative-grid,
  .duration-grid,
  .parsing-grid,
  .minmax-grid {
    grid-template-columns: 1fr;
  }
}
</style>
