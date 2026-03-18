<p align="center">
  <img src="./img.png" alt="D8 Logo" width="120" />
</p>

<h1 align="center">@anilkumarthakur/d8</h1>

<p align="center">
  <strong>A modern, zero-dependency TypeScript date/time library.</strong><br />
  Formatting · Parsing · Timezones · Business Days · Cron · Natural Language — all in one.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@anilkumarthakur/d8"><img src="https://img.shields.io/npm/v/@anilkumarthakur/d8?color=0066ff&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@anilkumarthakur/d8"><img src="https://img.shields.io/npm/dm/@anilkumarthakur/d8?color=22c55e" alt="downloads" /></a>
  <a href="https://github.com/AnilKumarThakur/snaptime/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@anilkumarthakur/d8?color=blue" alt="license" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <img src="https://img.shields.io/badge/dependencies-0-success" alt="zero dependencies" />
</p>

<p align="center">
  <a href="https://anilkumarthakur.github.io/snaptime/">📖 Documentation</a> ·
  <a href="https://www.npmjs.com/package/@anilkumarthakur/d8">📦 npm</a> ·
  <a href="https://github.com/AnilKumarThakur/snaptime">🐙 GitHub</a>
</p>

---

## ✨ Features

| Feature | Description |
|:--------|:------------|
| 🎯 **Fully Typed** | Written in TypeScript — every method, option, and return value is typed |
| 📦 **Zero Dependencies** | No external packages. Ships ESM, UMD, and type declarations |
| 🕐 **DateFormat** | 80+ instance methods: format, parse, compare, add/subtract, start/end of period, diff, age, countdown, calendar grid, fiscal year, ISO weeks, and more |
| ⏱️ **Duration** | Parse durations from strings (`"2h30m"`), convert between units, format, humanize |
| 📅 **DateRange** | Ranges with contains/overlaps/intersect/merge/split/iterate |
| 📚 **DateCollection** | Sort, filter, group, deduplicate, closest/farthest, min/max over sets of dates |
| 🌍 **Timezone** | Full IANA timezone support — offsets, DST detection, wall-clock formatting |
| 💼 **Business Days** | Add/subtract business days, skip weekends + holidays for 7 countries |
| ⏰ **Cron** | Parse 5-field cron expressions, next/prev match, between, humanize |
| 🗣️ **Natural Language** | Parse `"tomorrow"`, `"in 3 days"`, `"last Friday"`, `"3rd Monday of January"` |
| 🔌 **Plugin System** | Extend `DateFormat` with custom methods via a simple plugin API |
| 🌐 **Locale Support** | Register custom locales for month/weekday names and relative time |

---

## 📦 Installation

```bash
# npm
npm install @anilkumarthakur/d8

# yarn
yarn add @anilkumarthakur/d8

# pnpm
pnpm add @anilkumarthakur/d8

# bun
bun add @anilkumarthakur/d8
```

---

## 🚀 Quick Start

```typescript
import d8, { DateFormat, Timezone, Cron } from '@anilkumarthakur/d8'

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
date.isCurrentYear()          // true

// ── Relative time ────────────────────────────────────────────
date.fromNow()                // "in 5 days"  (depending on today)
date.age()                    // { years: 0, months: 0, days: 5 }

// ── Countdown ────────────────────────────────────────────────
date.countdown().format('DD days HH:mm:ss')  // "05 days 08:30:00"
date.countdown().humanize()                   // "5 days, 8 hours"

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
d8.natural('in 2 weeks').format('YYYY-MM-DD')

// ── Business days ────────────────────────────────────────────
d8.business.addBusinessDays(date, 5)
d8.business.getHolidays('US', 2026)

// ── Ranges ───────────────────────────────────────────────────
const range = d8.range('2026-01-01', '2026-12-31')
range.contains('2026-06-15')            // true
range.duration().humanize(false)        // "364 days"
range.split(1, 'month')                // DateRange[] (12 chunks)

// ── Collections ──────────────────────────────────────────────
const col = d8.collection(['2026-03-01', '2026-01-15', '2026-06-10'])
col.sort('asc').first().format('YYYY-MM-DD')  // "2026-01-15"
col.groupBy('month')                          // Map grouped by month
```

---

## 📖 API at a Glance

### DateFormat (Core)

| Category | Methods |
|:---------|:--------|
| **Create** | `new DateFormat()`, `DateFormat.parse()`, `DateFormat.min()`, `DateFormat.max()` |
| **Format** | `format()`, `formatIntl()`, `toISOString()`, `toJSON()`, `toSQL()`, `toSQLDate()`, `toSQLTime()`, `toRFC2822()`, `toRFC3339()`, `toExcel()`, `toObject()`, `toDate()` |
| **Get/Set** | `get(unit)`, `set(unit, value)`, `valueOf()`, `unix()`, `toMillis()` |
| **Arithmetic** | `add()`, `subtract()`, `startOf()`, `endOf()`, `clone()` |
| **Compare** | `isBefore()`, `isAfter()`, `isSame()`, `isBetween()`, `diff()` |
| **Queries** | `isValid()`, `isUtc()`, `isLocal()`, `isDST()`, `isLeapYear()`, `isWeekday()`, `isWeekend()` |
| **Day checks** | `isSunday()` … `isSaturday()` |
| **Period checks** | `isSameDay()`, `isCurrentDay()`, `isNextDay()`, `isLastDay()` — same pattern for Hour, Minute, Second, Millisecond, Week, Month, Year, Quarter, Decade, Century, Millennium |
| **Relative** | `fromNow()`, `calendar()`, `preciseDiff()`, `preciseFrom()`, `age()`, `countdown()` |
| **Calendar** | `calendarGrid()`, `daysInMonth()`, `dayOfYear()`, `weekday()`, `isoWeek()`, `isoWeekYear()`, `week()`, `weeksInYear()`, `quarter()` |
| **Fiscal** | `fiscalYear()`, `fiscalQuarter()` |
| **Plugin** | `DateFormat.use()`, `DateFormat.locale()` |

### Duration

`as()` · `add()` · `subtract()` · `humanize()` · `format()` · `toMilliseconds()` · `toSeconds()` · `toMinutes()` · `toHours()` · `toDays()` · `isZero()` · `isNegative()` · `abs()` · `Duration.parse()`

### DateRange

`contains()` · `overlaps()` · `intersect()` · `merge()` · `split()` · `iterate()` · `toArray()` · `duration()` · `humanize()` · `equals()` · `isValid()` · `isForward()`

### DateCollection

`sort()` · `filter()` · `groupBy()` · `unique()` · `closest()` · `farthest()` · `first()` · `last()` · `nth()` · `min()` · `max()` · `map()` · `toArray()` · `between()` · `compact()` · `count()` · `isEmpty()`

### Timezone

`format()` · `offsetMinutes()` · `offsetString()` · `isDST()` · `toLocalDate()` · `Timezone.guess()` · `Timezone.isValid()`

### Cron

`matches()` · `next()` · `prev()` · `between()` · `humanize()` · `toString()`

### Business Days

`isBusinessDay()` · `addBusinessDays()` · `subtractBusinessDays()` · `nextBusinessDay()` · `prevBusinessDay()` · `businessDaysBetween()` · `getHolidays()`

Supported holiday countries: 🇺🇸 US · 🇬🇧 UK · 🇮🇳 IN · 🇩🇪 DE · 🇫🇷 FR · 🇨🇦 CA · 🇦🇺 AU

### Natural Language

Parses: `"now"` · `"today"` · `"tomorrow"` · `"yesterday"` · `"next/last Monday"` · `"next/last week/month/year"` · `"N days/weeks/months/years ago"` · `"in N days/weeks/months/years"` · `"N days from now"` · `"beginning/end of day/week/month/year"` · `"first/last day of March"` · `"3rd Friday of January 2027"`

---

## 🎨 Format Tokens

| Token | Output | Example |
|:------|:-------|:--------|
| `YYYY` | 4-digit year | `2026` |
| `YY` | 2-digit year | `26` |
| `Q` | Quarter | `1` |
| `MMMM` | Full month | `March` |
| `MMM` | Short month | `Mar` |
| `MM` | Month (zero-padded) | `03` |
| `M` | Month | `3` |
| `Mo` | Month (ordinal) | `3rd` |
| `Do` | Day (ordinal) | `18th` |
| `DD` | Day (zero-padded) | `18` |
| `D` | Day | `18` |
| `DDDD` | Day of year (3-digit) | `077` |
| `DDD` | Day of year | `77` |
| `WW` | ISO week (zero-padded) | `12` |
| `W` | ISO week | `12` |
| `dddd` | Full weekday | `Wednesday` |
| `ddd` | Short weekday | `Wed` |
| `dd` | Min weekday | `We` |
| `d` | Weekday number | `3` |
| `HH` | 24h hour (zero-padded) | `09` |
| `H` | 24h hour | `9` |
| `hh` | 12h hour (zero-padded) | `09` |
| `h` | 12h hour | `9` |
| `mm` | Minutes (zero-padded) | `05` |
| `m` | Minutes | `5` |
| `ss` | Seconds (zero-padded) | `03` |
| `s` | Seconds | `3` |
| `A` | AM/PM | `AM` |
| `a` | am/pm | `am` |
| `X` | Unix timestamp (seconds) | `1774022400` |
| `x` | Unix timestamp (ms) | `1774022400000` |
| `Z` | UTC offset | `+05:45` |
| `ZZ` | UTC offset (compact) | `+0545` |
| `gg` | ISO week year | `2026` |

---

## 🔌 Plugin System

Extend D8 with custom methods:

```typescript
import { DateFormat, dateFormat } from '@anilkumarthakur/d8'

// Create a plugin
const businessHoursPlugin = (DF: any) => {
  DF.prototype.isBusinessHours = function () {
    const h = this.get('hour')
    return h >= 9 && h < 17 && this.isWeekday()
  }
}

// Register it
DateFormat.use(businessHoursPlugin)
```

---

## 🌐 Locale Support

```typescript
import { DateFormat, dateFormat } from '@anilkumarthakur/d8'

DateFormat.locale('es', {
  months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
})

dateFormat('2026-03-18').format('dddd, MMMM Do YYYY')
// "Miércoles, Marzo 18th 2026"
```

---

## 📄 TypeScript

D8 ships full type declarations. Import types directly:

```typescript
import type {
  Unit,
  PreciseDiffResult,
  AgeResult,
  CountdownResult,
  CalendarCell,
  CalendarGridOptions,
  FiscalConfig,
  CronField,
  HolidayCountry,
  LocaleData,
  PluginFn,
} from '@anilkumarthakur/d8'
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

```bash
git clone https://github.com/AnilKumarThakur/snaptime.git
cd snaptime
npm install
npm run dev       # dev server
npm run jest      # run tests
npm run build     # production build
```

---

## 📝 License

[MIT](./LICENSE) © [Anil Kumar Thakur](https://github.com/AnilKumarThakur)
