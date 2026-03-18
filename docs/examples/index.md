# Examples

Practical examples of using D8 for common date and time operations.

## Quick Navigation

- [Date Formatting](./formatting) - Format dates in various styles
- [Date Arithmetic](./arithmetic) - Add, subtract, and manipulate dates
- [Working with Timezones](./timezones) - Handle multiple timezones
- [Business Days](./business-days) - Work with business calendars
- [Cron Scheduling](./cron) - Schedule recurring events

## Common Use Cases

### Display Today's Date

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

const today = new DateFormat()
console.log(today.format('MMMM D, YYYY'))
// Output: "January 15, 2024"
```

### Calculate Age

```typescript
const birthdate = new DateFormat('1990-05-15')
const today = new DateFormat()
const age = Math.floor(today.diff(birthdate, 'day') / 365.25)
console.log(`Age: ${age}`)
```

### Check if Date is in the Past

```typescript
const date = new DateFormat('2020-01-01')
const today = new DateFormat()
console.log(date.isBefore(today)) // true
```

### Get Next Monday

```typescript
const today = new DateFormat()
let nextMonday = today.add(1, 'day')
while (nextMonday.get('day') !== 1) {
  nextMonday = nextMonday.add(1, 'day')
}
console.log(nextMonday.format('YYYY-MM-DD'))
```

## See Also

Head to specific example pages for detailed code and explanations.
