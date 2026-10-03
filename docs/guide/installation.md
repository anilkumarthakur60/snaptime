# Installation

## Package Managers

::: code-group

```bash [npm]
npm install @anil-labs/snaptime
```

```bash [yarn]
yarn add @anil-labs/snaptime
```

```bash [pnpm]
pnpm add @anil-labs/snaptime
```

```bash [bun]
bun add @anil-labs/snaptime
```

:::

## Import Styles

### ES Modules (recommended)

```typescript
// Default factory import
import snaptime from '@anil-labs/snaptime'

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
} from '@anil-labs/snaptime'
```

### CommonJS

```javascript
const {
  DateFormat,
  Duration,
  Timezone,
  dateFormat,
} = require('@anil-labs/snaptime')
```

### Browser (UMD)

```html
<script src="https://unpkg.com/@anil-labs/snaptime"></script>
<script>
  // All exports are available on the global object
  const date = new Snaptime.DateFormat('2026-03-18')
  console.log(date.format('YYYY-MM-DD'))
</script>
```

## TypeScript

snaptime ships its own type declarations  no `@types/` package required. Just import and go:

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
} from '@anil-labs/snaptime'
```

## Verify Installation

```typescript
import snaptime from '@anil-labs/snaptime'

const today = snaptime()
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

- [Quick Start](./quick-start)  Write your first snaptime program
- [DateFormat](./dateformat)  Explore the core class
