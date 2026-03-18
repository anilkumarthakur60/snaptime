# Installation

## Package Managers

::: code-group

```bash [npm]
npm install @anilkumarthakur/d8
```

```bash [yarn]
yarn add @anilkumarthakur/d8
```

```bash [pnpm]
pnpm add @anilkumarthakur/d8
```

```bash [bun]
bun add @anilkumarthakur/d8
```

:::

## Import Styles

### ES Modules (recommended)

```typescript
// Default factory import
import d8 from '@anilkumarthakur/d8'

// Named imports
import {
  DateFormat,
  Duration,
  DateRange,
  DateCollection,
  Timezone,
  Cron,
  parseNatural,
  isBusinessDay,
  addBusinessDays,
  getHolidays,
  dateFormat,
} from '@anilkumarthakur/d8'
```

### CommonJS

```javascript
const {
  DateFormat,
  Duration,
  Timezone,
  dateFormat,
} = require('@anilkumarthakur/d8')
```

### Browser (UMD)

```html
<script src="https://unpkg.com/@anilkumarthakur/d8/dist/index.umd.js"></script>
<script>
  // All exports are available on the global object
  const date = new D8.DateFormat('2026-03-18')
  console.log(date.format('YYYY-MM-DD'))
</script>
```

## TypeScript

D8 ships its own type declarations — no `@types/` package required. Just import and go:

```typescript
import type {
  Unit,
  PreciseDiffResult,
  AgeResult,
  CountdownResult,
  CalendarCell,
  CalendarGridOptions,
  FiscalConfig,
  HolidayCountry,
  LocaleData,
  PluginFn,
} from '@anilkumarthakur/d8'
```

## Verify Installation

```typescript
import d8 from '@anilkumarthakur/d8'

const today = d8()
console.log(today.format('dddd, MMMM Do YYYY'))
// e.g. "Wednesday, March 18th 2026"
```

Run it:

```bash
npx ts-node verify.ts
# or
npx tsx verify.ts
```

You should see today's date printed in a long format. You're ready to go! 🎉

## Next Steps

- [Quick Start](./quick-start) — Write your first D8 program
- [DateFormat](./dateformat) — Explore the core class
