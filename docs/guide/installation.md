# Installation

## NPM

```bash
npm install @anilkumarthakur/d8
```

## Yarn

```bash
yarn add @anilkumarthakur/d8
```

## PNPM

```bash
pnpm add @anilkumarthakur/d8
```

## Bun

```bash
bun add @anilkumarthakur/d8
```

## Import

### ES Module

```typescript
import { DateFormat, Duration, Timezone } from '@anilkumarthakur/d8'
```

### CommonJS

```javascript
const { DateFormat, Duration, Timezone } = require('@anilkumarthakur/d8')
```

## Browser

D8 is also available as a UMD bundle:

```html
<script src="https://unpkg.com/@anilkumarthakur/d8/dist/index.umd.js"></script>
<script>
  const { DateFormat } = window.D8
  const date = new DateFormat('2024-01-15')
  console.log(date.format('YYYY-MM-DD'))
</script>
```

## TypeScript

D8 is built with TypeScript and includes full type definitions. No additional packages needed for TypeScript support.

```typescript
import type { DateFormatOptions, DurationUnit } from '@anilkumarthakur/d8'
```

## Verify Installation

Create a test file to verify everything works:

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

const today = new DateFormat()
console.log(today.format('YYYY-MM-DD'))
```

Run it:

```bash
npx ts-node test.ts
```

You should see today's date printed in YYYY-MM-DD format.
