# Introduction

D8 is a modern, fully-typed TypeScript date/time library that provides comprehensive date manipulation, formatting, and timezone support.

## Why D8?

- **🎯 Type-Safe**: Full TypeScript support with no `any` types
- **🌍 Timezone-Aware**: Built-in IANA timezone support
- **⏱️ Business-Friendly**: Business day calculations and working hours support
- **⏰ Cron Support**: Parse and evaluate cron expressions
- **🔄 Chainable API**: Fluent interface for date operations
- **🎨 Flexible Formatting**: Powerful date/time formatting with custom tokens
- **📦 Zero Dependencies**: Minimal, focused library with no external dependencies

## Features

### Core Classes

- **DateFormat**: Work with dates in local or UTC mode with extensive formatting options
- **Duration**: Handle time intervals with automatic unit conversion
- **DateRange**: Manage date ranges with iteration and filtering
- **Timezone**: Convert between timezones and handle DST automatically
- **BusinessDay**: Calculate business days, skip weekends and holidays
- **Cron**: Parse and evaluate cron expressions for scheduling
- **DateCollection**: Perform batch operations on multiple dates
- **NaturalLanguage**: Convert dates to human-readable text

## Quick Example

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

// Create a date
const date = new DateFormat('2024-01-15')

// Format it
console.log(date.format('YYYY-MM-DD')) // 2024-01-15
console.log(date.format('dddd, MMMM Do')) // Monday, January 15th

// Manipulate it
const nextWeek = date.add(7, 'day')
const nextMonth = date.add(1, 'month')

// Work with timezones
const nyTime = date.tz('America/New_York')

// Get relative dates
console.log(date.fromNow()) // e.g., "2 days ago"
```

## Installation

```bash
npm install @anilkumarthakur/d8
```

## Next Steps

- [Installation](./installation) - Get started with D8
- [Quick Start](./quick-start) - Your first D8 program
- [Core Concepts](./dateformat) - Learn the main classes
