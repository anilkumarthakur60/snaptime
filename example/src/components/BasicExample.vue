<template>
  <div class="demo">
    <h1>Basic SnapTime Usage</h1>

    <!-- Date Creation -->
    <section>
      <h2>Creating Dates</h2>
      <code>
        {{
          `
const now = dateFormat()
const christmas = dateFormat('2025-12-25')
const from = dateFormat(1640995200000)
const copy = dateFormat(anotherDate)
        `
        }}
      </code>
    </section>

    <!-- Formatting -->
    <section>
      <h2>Formatting Dates</h2>
      <p>Current: {{ currentFormatted }}</p>
      <p>Full: {{ fullFormatted }}</p>
      <p>Custom: {{ customFormatted }}</p>
    </section>

    <!-- Manipulation -->
    <section>
      <h2>Manipulating Dates</h2>
      <p>Tomorrow: {{ tomorrow }}</p>
      <p>Next week: {{ nextWeek }}</p>
      <p>Next month: {{ nextMonth }}</p>
    </section>

    <!-- Comparisons -->
    <section>
      <h2>Comparing Dates</h2>
      <p>Is today before tomorrow? {{ isBeforeTomorrow }}</p>
      <p>Is yesterday before today? {{ isYesterdayBeforeToday }}</p>
      <p>Days until Christmas: {{ daysUntilChristmas }}</p>
    </section>

    <!-- Relative Time -->
    <section>
      <h2>Relative Time</h2>
      <p>Now: {{ now }}</p>
      <p>5 hours ago: {{ fiveHoursAgo }}</p>
      <p>Tomorrow: {{ tomorrowRelative }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { dateFormat } from '../../../src/package'

const now = ref<any>(dateFormat())

// Formatting
const currentFormatted = computed(() => now.value.format('YYYY-MM-DD HH:mm:ss'))

const fullFormatted = computed(() => now.value.format('dddd, MMMM DD, YYYY'))

const customFormatted = computed(() => now.value.format('[Today is] dddd'))

// Manipulation
const tomorrow = computed(() => now.value.add(1, 'day').format('YYYY-MM-DD'))

const nextWeek = computed(() => now.value.add(7, 'day').format('YYYY-MM-DD'))

const nextMonth = computed(() => now.value.add(1, 'month').format('YYYY-MM-DD'))

// Comparisons
const isBeforeTomorrow = computed(() => now.value.isBefore(now.value.add(1, 'day')))

const yesterday = computed(() => now.value.subtract(1, 'day'))

const isYesterdayBeforeToday = computed(() => yesterday.value.isBefore(now.value))

const christmas = computed(() => dateFormat('2025-12-25'))

const daysUntilChristmas = computed(() => christmas.value.diff(now.value, 'day'))

// Relative Time
const nowRelative = computed(() => now.value.fromNow())

const fiveHoursAgo = computed(() => {
  const time = now.value.subtract(5, 'hour')
  return time.fromNow()
})

const tomorrowRelative = computed(() => {
  const time = now.value.add(1, 'day')
  return time.fromNow()
})
</script>

<style scoped>
.demo {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

h1 {
  color: #333;
  margin-bottom: 2rem;
}

h2 {
  color: #666;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

p {
  margin: 0.5rem 0;
  color: #555;
  line-height: 1.6;
}

code {
  display: block;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
  white-space: pre-wrap;
}
</style>
