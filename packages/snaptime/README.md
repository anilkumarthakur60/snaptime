<h1 align="center">@anil-labs/snaptime</h1>

<p align="center">
  <strong>A modern, zero-dependency TypeScript date/time library.</strong><br />
  Formatting · Parsing · Timezones · Business Days · Cron · RRULE · Natural Language · Bikram Sambat · Astronomy — all in one.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@anil-labs/snaptime"><img src="https://img.shields.io/npm/v/@anil-labs/snaptime?color=0066ff&label=npm" alt="npm version" /></a>
  <a href="https://github.com/anilkumarthakur60/snaptime/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@anil-labs/snaptime?color=blue" alt="license" /></a>
  <img src="https://img.shields.io/badge/dependencies-0-success" alt="zero dependencies" />
</p>

<p align="center">
  <a href="https://anilkumarthakur60.github.io/snaptime/">📖 Documentation</a> ·
  <a href="https://www.npmjs.com/package/@anil-labs/snaptime">📦 npm</a> ·
  <a href="https://github.com/anilkumarthakur60/snaptime">🐙 GitHub</a>
</p>

---

## ✨ Features

| Feature | Description |
|:--------|:------------|
| 🎯 **Fully Typed** | Written in strict TypeScript — every method, option, and return value is typed |
| 📦 **Zero Dependencies** | No external packages. Ships ESM, CJS, a CDN global bundle, and type declarations |
| 🕐 **DateTime** | 80+ instance methods: format, parse, compare, add/subtract, start/end of period, diff, age, countdown, calendar grid, fiscal year, ISO weeks, and more |
| ⏱️ **Duration** | Parse durations from strings (`"2h30m"`), convert between units, format, humanize |
| 📅 **DateRange** | Ranges with contains/overlaps/intersect/merge/split/iterate |
| 📚 **DateCollection** | Sort, filter, group, deduplicate, closest/farthest, min/max over sets of dates |
| 🌍 **Timezone** | Full IANA timezone support — offsets, DST detection, wall-clock formatting |
| 💼 **Business Days** | Add/subtract business days, skip weekends + holidays for 7 countries |
| ⏰ **Cron** | Parse 5-field cron expressions, next/prev match, between, humanize |
| 🔁 **RRULE** | iCalendar (RFC 5545) recurrence rules — parse, stringify, iterate occurrences |
| 🗣️ **Natural Language** | Parse `"tomorrow"`, `"in 3 days"`, `"last Friday"`, `"3rd Monday of January"` |
| 🇳🇵 **Bikram Sambat** | Convert between Gregorian and Nepali BS calendar dates |
| 🌙 **Astronomy** | Sunrise/sunset, moon phases, seasons |
| ✅ **Validators** | Composable date validation rules |
| 🔌 **Plugin System** | Extend `DateTime` with custom methods via a simple plugin API |
| 🌐 **Locale Support** | 19 built-in locales, tree-shakable — plus custom locale registration |

## 📦 Installation

```bash
# npm
npm install @anil-labs/snaptime

# yarn
yarn add @anil-labs/snaptime

# pnpm
pnpm add @anil-labs/snaptime

# bun
bun add @anil-labs/snaptime
```

### CDN (no build step)

```html
<script src="https://unpkg.com/@anil-labs/snaptime"></script>
<script>
  const { dateTime, Duration, Cron } = Snaptime
  dateTime('2026-03-18').format('dddd, MMMM Do YYYY') // "Wednesday, March 18th 2026"
</script>
```

## 🚀 Quick Start

```typescript
import d8, { DateTime, Timezone, Cron } from '@anil-labs/snaptime'

// ── Create & format ──────────────────────────────────────────
const date = d8('2026-03-18')
date.format('dddd, MMMM Do YYYY')   // "Wednesday, March 18th 2026"
date.format('hh:mm A')              // "12:00 AM"

// ── Arithmetic ───────────────────────────────────────────────
date.add(7, 'day').format('YYYY-MM-DD')      // "2026-03-25"
date.subtract(1, 'month').format('MMM YYYY') // "Feb 2026"

// ── Comparisons ──────────────────────────────────────────────
date.isBefore('2027-01-01')   // true
date.isWeekday()              // true
date.isLeapYear()             // false

// ── Relative time ────────────────────────────────────────────
date.fromNow()                // "in 5 days"  (depending on today)
date.age()                    // { years: 0, months: 0, days: 5 }
date.countdown().humanize()   // "5 days, 8 hours"

// ── Serialization ────────────────────────────────────────────
date.toISOString()   // "2026-03-18T00:00:00.000Z"
date.toSQL()         // "2026-03-18 00:00:00"
date.toRFC2822()     // "Wed, 18 Mar 2026 00:00:00 +0000"
date.toExcel()       // 46093

// ── Timezones ────────────────────────────────────────────────
const tz = new Timezone('America/New_York')
tz.format(date, 'HH:mm Z')     // "19:00 -05:00"
tz.isDST(date)                  // true
Timezone.guess()                // "Asia/Kathmandu" (your system TZ)

// ── Cron ─────────────────────────────────────────────────────
const job = new Cron('30 9 * * 1-5')
job.humanize()                  // "At 09:30, Monday through Friday"
job.next().format('YYYY-MM-DD HH:mm')

// ── Natural language ─────────────────────────────────────────
d8.natural('next friday').format('YYYY-MM-DD')
d8.natural('3rd Monday of January 2027').format('YYYY-MM-DD')

// ── Business days ────────────────────────────────────────────
d8.business.addBusinessDays(date, 5)
d8.business.getHolidays('US', 2026)

// ── Ranges ───────────────────────────────────────────────────
const range = d8.range('2026-01-01', '2026-12-31')
range.contains('2026-06-15')            // true
range.split(1, 'month')                 // DateRange[] (12 chunks)

// ── Collections ──────────────────────────────────────────────
const col = d8.collection(['2026-03-01', '2026-01-15', '2026-06-10'])
col.sort('asc').first().format('YYYY-MM-DD')  // "2026-01-15"
```

## 🧩 Sub-path imports (tree-shaking friendly)

Only pull in what you use:

```typescript
import { RRule } from '@anil-labs/snaptime/rrule'           // iCal recurrence rules
import { Astronomy } from '@anil-labs/snaptime/astronomy'   // sunrise/sunset, moon, seasons
import { DateRule } from '@anil-labs/snaptime/validate'     // validators
import { BikramSambat } from '@anil-labs/snaptime/calendars/bs' // Nepali calendar
import { RangeSet } from '@anil-labs/snaptime/collections/RangeSet'

// Locales register themselves on import:
import '@anil-labs/snaptime/locale/fr'
import '@anil-labs/snaptime/locale/ne'
```

Available locales: `en` `es` `fr` `de` `ja` `zh-cn` `hi` `pt` `it` `ar` `ne` `ko` `vi` `tr` `ru` `nl` `pl` `id` `th`

## 🌐 Locale Support

```typescript
import { DateTime } from '@anil-labs/snaptime'

DateTime.locale('es', {
  months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
})
```

## 🔌 Plugin System

```typescript
import { DateTime } from '@anil-labs/snaptime'

DateTime.use((DT) => {
  DT.prototype.isBusinessHours = function () {
    const h = this.get('hour')
    return h >= 9 && h < 17 && this.isWeekday()
  }
})
```

## 📖 Documentation

Full guides, API reference, and examples: **https://anilkumarthakur60.github.io/snaptime/**

## 🤝 Contributing

Contributions are welcome — see the
[repository on GitHub](https://github.com/anilkumarthakur60/snaptime).

```bash
git clone https://github.com/anilkumarthakur60/snaptime.git
cd snaptime
pnpm install
pnpm build     # build the library
pnpm test      # run tests
```

## 📝 License

[MIT](https://github.com/anilkumarthakur60/snaptime/blob/main/LICENSE) © [Anil Kumar Thakur](https://github.com/anilkumarthakur60)
