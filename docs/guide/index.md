# Introduction

**D8** is a modern, zero-dependency TypeScript date/time library that gives you everything you need for date manipulation, formatting, timezone handling, business calendars, cron scheduling, and natural language parsing — in a single, fully-typed package.

## Why D8?

Most date libraries ask you to choose: lightweight _or_ feature-rich. D8 gives you both.

| | D8 |
|:--|:--|
| **Type safety** | 100 % TypeScript — no `any` escape hatches |
| **Dependencies** | Zero |
| **Bundle** | ESM + UMD + `.d.ts` — use anywhere |
| **Methods** | 80+ on `DateFormat` alone |
| **Timezones** | Full IANA support via built-in `Intl` |
| **Business logic** | Business days + holidays for 7 countries |
| **Scheduling** | Cron expression parsing & matching |
| **Natural language** | `"next friday"`, `"in 3 days"`, `"3rd Monday of January"` |
| **Extensible** | Plugin system with declaration merging |

## Core Modules

### 🕐 DateFormat
The heart of D8. Create, format, parse, compare, diff, and query dates with 80+ chainable methods. Supports UTC, local, ordinals, ISO weeks, quarters, fiscal years, calendar grids, countdown timers, and more.

### ⏱️ Duration
Represent lengths of time. Parse from strings (`"2h30m"`), convert between units, format with templates, and humanize to human-readable strings.

### 📅 DateRange
Model a start–end pair. Check containment, overlap, intersection, merge, split into chunks, and iterate day-by-day (or any unit).

### 📚 DateCollection
Work with sets of dates. Sort, filter, group by period, deduplicate, find closest/farthest, and extract min/max.

### 🌍 Timezone
Full IANA timezone support. Get UTC offsets, detect DST, format dates in any timezone, and guess the system timezone.

### 💼 Business Days
Add or subtract business days skipping weekends and public holidays. Built-in holiday calendars for US, UK, India, Germany, France, Canada, and Australia.

### ⏰ Cron
Parse standard 5-field cron expressions. Check if a date matches, find next/previous occurrences, list matches in a range, and get a human-readable description.

### 🗣️ Natural Language
Parse phrases like `"tomorrow"`, `"in 2 weeks"`, `"last Friday"`, `"end of month"`, `"first day of March 2027"`, and `"3rd Thursday of November"`.

## Quick Example

```typescript
import d8 from '@anilkumarthakur/d8'

// Create & format
const date = d8('2026-03-18')
date.format('dddd, MMMM Do YYYY') // "Wednesday, March 18th 2026"

// Arithmetic
date.add(1, 'month').format('MMM YYYY') // "Apr 2026"

// Query
date.isWeekday()     // true
date.isLeapYear()    // false
date.quarter()       // 1

// Relative time
date.fromNow()       // "in 5 days"
date.age().toString() // "0d"

// Countdown
date.countdown().humanize() // "5 days, 8 hours"
```

## Next Steps

- [Installation](./installation) — Set up D8 in your project
- [Quick Start](./quick-start) — Build your first date program
- [DateFormat](./dateformat) — Deep dive into the core class
