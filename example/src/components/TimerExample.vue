<template>
  <div class="example">
    <h1>⏰ Timer & Countdown Examples</h1>

    <!-- Live Clock -->
    <section>
      <h2>Live Clock</h2>
      <div class="time-display">{{ currentTime }}</div>
      <p class="label">Updates every second</p>
    </section>

    <!-- Countdown -->
    <section>
      <h2>Countdown to Event</h2>
      <div class="countdown">{{ countdownText }}</div>
      <p class="label">Time until target date: {{ targetDate }}</p>
    </section>

    <!-- Session Timer -->
    <section>
      <h2>Session Duration</h2>
      <div class="duration-display">{{ sessionDuration }}</div>
      <p class="label">Elapsed time: {{ elapsedTime }}</p>
    </section>

    <!-- Work/Break Timer -->
    <section>
      <h2>Pomodoro Timer</h2>
      <div class="pomodoro">
        <div class="phase">{{ pomodoroPhase }}</div>
        <div class="time">{{ pomodoroTime }}</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { dateFormat, TimeDuration } from '@anilkumarthakur/snaptime'

// Live Clock
const now = ref<any>(dateFormat())
let clockInterval: ReturnType<typeof setInterval>

const currentTime = computed(() => (now.value as any).format('HH:mm:ss'))

onMounted(() => {
  clockInterval = setInterval(() => {
    now.value = dateFormat()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(clockInterval)
})

// Countdown
const targetDate = computed(() => {
  const nextMonth = (dateFormat() as any).add(1, 'month').startOf('month')
  return nextMonth.format('YYYY-MM-DD')
})

const countdownText = computed(() => {
  const target = dateFormat().add(1, 'month').startOf('month')
  const diff = target.diff(dateFormat())
  const duration = new TimeDuration(diff)

  const days = Math.floor(duration.asDays())
  const hours = Math.floor(duration.asHours() % 24)
  const minutes = Math.floor(duration.asMinutes() % 60)
  const seconds = Math.floor(duration.asSeconds() % 60)

  return `${days}d ${hours}h ${minutes}m ${seconds}s`
})

// Session Timer
const sessionStart = ref(dateFormat())

const sessionDuration = computed(() => {
  const duration = dateFormat().diff(sessionStart.value)
  return new TimeDuration(duration).humanize(true)
})

const elapsedTime = computed(() => {
  const duration = dateFormat().diff(sessionStart.value)
  const dur = new TimeDuration(duration)
  const mins = Math.floor(dur.asMinutes())
  const secs = Math.floor(dur.asSeconds() % 60)
  return `${mins}m ${secs}s`
})

// Pomodoro Timer
const pomodoroStart = ref(dateFormat())
const pomodoroWorkDuration = ref(25 * 60 * 1000) // 25 minutes
const pomodoroBreakDuration = ref(5 * 60 * 1000) // 5 minutes
const isWorkPhase = ref(true)

const pomodoroElapsed = computed(() => {
  return dateFormat().diff(pomodoroStart.value)
})

const pomodoroPhase = computed(() => (isWorkPhase.value ? '🔴 Work' : '🟢 Break'))

const pomodoroTime = computed(() => {
  const duration = isWorkPhase.value ? pomodoroWorkDuration.value : pomodoroBreakDuration.value
  const remaining = duration - pomodoroElapsed.value
  const mins = Math.floor(Math.max(0, remaining) / 60000)
  const secs = Math.floor((Math.max(0, remaining) / 1000) % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})
</script>

<style scoped>
.example {
  max-width: 600px;
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
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

h2 {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

.time-display,
.countdown,
.duration-display {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  color: #667eea;
  font-family: 'Courier New', monospace;
  margin: 1.5rem 0;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 2px solid #667eea;
}

.label {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
}

.pomodoro {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.phase {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.time {
  font-size: 3rem;
  font-weight: bold;
  color: #667eea;
  font-family: 'Courier New', monospace;
}
</style>
