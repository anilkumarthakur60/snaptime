# Natural Language

D8 can parse dates from English phrases. The `parseNatural` function (also available as `d8.natural()`) converts human-readable strings into `DateFormat` instances.

## Basic Usage

```typescript
import d8, { parseNatural } from '@anilkumarthakur/d8'

// Via factory (recommended)
d8.natural('tomorrow').format('YYYY-MM-DD')

// Direct function
parseNatural('tomorrow').format('YYYY-MM-DD')
```

## Supported Patterns

### Simple Keywords

```typescript
d8.natural('now')         // current date/time
d8.natural('today')       // current date/time
d8.natural('tomorrow')    // +1 day
d8.natural('yesterday')   // -1 day
```

### Next / Last Weekday

```typescript
d8.natural('next monday')
d8.natural('next friday')
d8.natural('last wednesday')
d8.natural('next saturday')
d8.natural('last sunday')
```

### Next / Last Period

```typescript
d8.natural('next week')
d8.natural('last month')
d8.natural('next year')
d8.natural('last week')
```

### Relative with Numbers

```typescript
// "N units ago"
d8.natural('3 days ago')
d8.natural('2 weeks ago')
d8.natural('6 months ago')
d8.natural('1 year ago')

// "in N units"
d8.natural('in 3 days')
d8.natural('in 2 weeks')
d8.natural('in 6 months')
d8.natural('in 1 year')

// "N units from now"
d8.natural('5 days from now')
d8.natural('3 weeks from now')
d8.natural('2 months from now')
```

### Beginning / End of Period

```typescript
d8.natural('beginning of day')     // midnight today
d8.natural('beginning of week')    // start of current week
d8.natural('beginning of month')   // 1st of current month
d8.natural('beginning of year')    // Jan 1

d8.natural('end of day')           // 23:59:59.999 today
d8.natural('end of week')          // end of current week
d8.natural('end of month')         // last moment of current month
d8.natural('end of year')          // Dec 31, 23:59:59.999
```

### First / Last Day of Month

```typescript
d8.natural('first day of March')
d8.natural('last day of March')
d8.natural('first day of December 2027')
d8.natural('last day of February 2028')  // handles leap years
```

### Nth Weekday of Month

```typescript
d8.natural('1st Monday of January')
d8.natural('3rd Friday of March')
d8.natural('2nd Tuesday of November 2027')
d8.natural('4th Thursday of November')  // Thanksgiving!
```

## Custom Reference Date

By default, relative dates are calculated from "now". You can pass a custom reference:

```typescript
const ref = d8('2026-06-15')

d8.natural('tomorrow', ref).format('YYYY-MM-DD')
// "2026-06-16"

d8.natural('3 days ago', ref).format('YYYY-MM-DD')
// "2026-06-12"

d8.natural('next friday', ref).format('YYYY-MM-DD')
// "2026-06-19"
```

## Invalid Input

Unrecognized patterns return an invalid `DateFormat`:

```typescript
const result = d8.natural('the day after tomorrow')
result.isValid()  // false

const result2 = d8.natural('gibberish')
result2.isValid() // false
```

::: tip Always Validate
When accepting user input, always check `.isValid()` before using the result:
```typescript
const parsed = d8.natural(userInput)
if (parsed.isValid()) {
  console.log(parsed.format('YYYY-MM-DD'))
} else {
  console.log('Could not understand that date')
}
```
:::

## Supported Units

| Input | Unit |
|:------|:-----|
| `day` / `days` | day |
| `week` / `weeks` | week |
| `month` / `months` | month |
| `year` / `years` | year |

## Complete Reference Table

| Pattern | Example Output |
|:--------|:---------------|
| `now` | Current moment |
| `today` | Current moment |
| `tomorrow` | +1 day |
| `yesterday` | -1 day |
| `next {weekday}` | Next occurrence |
| `last {weekday}` | Previous occurrence |
| `next week/month/year` | +1 period |
| `last week/month/year` | -1 period |
| `N days/weeks/months/years ago` | -N periods |
| `in N days/weeks/months/years` | +N periods |
| `N days/weeks/months/years from now` | +N periods |
| `beginning of day/week/month/year` | Start of period |
| `end of day/week/month/year` | End of period |
| `first day of {month} [year]` | 1st of month |
| `last day of {month} [year]` | Last day of month |
| `{N}th {weekday} of {month} [year]` | Specific occurrence |

## Next Steps

- [Plugin System](./plugins) — Extend D8 with custom methods
- [API Reference](../api/natural-language) — Complete method signatures
