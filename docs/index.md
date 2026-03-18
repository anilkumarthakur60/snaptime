---
layout: home

hero:
  name: "D8"
  text: "Modern Date/Time for TypeScript"
  tagline: "Zero-dependency, fully typed date library — formatting, parsing, timezones, business days, cron, and natural language."
  image:
    src: /logo.png
    alt: D8 Logo
  actions:
    - theme: brand
      text: Get Started →
      link: /guide/
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: View on GitHub
      link: https://github.com/anilkumarthakur60/snaptime

features:
  - icon: 🎯
    title: Fully Typed
    details: Built from the ground up in TypeScript. Every method, option, and return value has precise types — no <code>any</code> escape hatches.
  - icon: 📦
    title: Zero Dependencies
    details: Ships ESM + UMD + type declarations with zero external packages. ~40 KB unminified — everything included.
  - icon: 🕐
    title: 80+ Methods
    details: Format, parse, compare, diff, age, countdown, calendar grid, fiscal year, ISO weeks, ordinals, and dozens of is‑checks.
  - icon: 🌍
    title: Timezone Support
    details: Full IANA timezone support using the built-in Intl API. Offsets, DST detection, and wall-clock formatting.
  - icon: 💼
    title: Business Days & Holidays
    details: Add/subtract business days, skip weekends + public holidays for US, UK, IN, DE, FR, CA, AU.
  - icon: ⏰
    title: Cron Expressions
    details: Parse 5-field cron expressions, find next/previous matches, list matches between dates, and humanize to English.
  - icon: 🗣️
    title: Natural Language Parsing
    details: Parse phrases like "tomorrow", "in 3 days", "last Friday", "3rd Monday of January", and "end of month".
  - icon: 📅
    title: Ranges & Collections
    details: DateRange with contains/overlaps/merge/split/iterate. DateCollection with sort/group/unique/closest/filter.
  - icon: ⏱️
    title: Duration
    details: Parse durations from strings like "2h30m", convert between units, format with templates, and humanize.
  - icon: 🔌
    title: Plugin System
    details: Extend DateFormat with custom methods through a lightweight plugin API. Type-safe declaration merging included.
  - icon: 🌐
    title: Locale Support
    details: Register custom locales for month names, weekday names, and relative time strings.
  - icon: 📄
    title: Multiple Serializations
    details: Output to ISO 8601, SQL, RFC 2822, RFC 3339, Excel serial numbers, and plain objects.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --vp-home-hero-image-background-image: linear-gradient(135deg, #667eea33 0%, #764ba233 100%);
  --vp-home-hero-image-filter: blur(56px);
}
</style>

## Quick Example

```typescript
import d8, { Timezone, Cron } from '@anilkumarthakur/d8'

const date = d8('2026-03-18')
date.format('dddd, MMMM Do YYYY')       // "Wednesday, March 18th 2026"
date.add(7, 'day').format('YYYY-MM-DD') // "2026-03-25"
date.isWeekday()                         // true
date.countdown().humanize()              // "5 days, 8 hours"

const tz = new Timezone('America/New_York')
tz.format(date, 'HH:mm Z')              // "19:00 -05:00"

const job = new Cron('30 9 * * 1-5')
job.humanize()                           // "At 09:30, Monday through Friday"

d8.natural('next friday').format('YYYY-MM-DD')
d8.business.getHolidays('US', 2026)
```
