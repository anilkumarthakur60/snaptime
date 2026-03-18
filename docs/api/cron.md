# Cron API

Parse and evaluate standard 5-field cron expressions.

## Constructor

```typescript
new Cron(expression: string)
```

Throws an `Error` if the expression does not have exactly 5 fields.

**Supports:** wildcards (`*`), values (`5`), lists (`1,3,5`), ranges (`1-5`), steps (`*/15`, `1-5/2`), and day name abbreviations (`MON`–`SUN`).

---

## Instance Methods

### `matches(date): boolean`

Check if a `DateFormat` matches this cron expression.

::: info DOM + DOW Logic
When both day-of-month and day-of-week are specified (neither is `*`), a date matches if **either** condition is true (OR). Otherwise, AND logic applies.
:::

### `next(from?): DateFormat`

Find the next matching date/time after `from` (defaults to now). Searches up to 366 days ahead.

### `prev(from?): DateFormat`

Find the most recent past match before `from` (defaults to now). Searches up to 366 days back.

### `between(start, end, limit?): DateFormat[]`

| Param | Type | Description |
|:------|:-----|:------------|
| `start` | `DateFormat` | Range start |
| `end` | `DateFormat` | Range end |
| `limit` | `number` | Max results (optional) |

### `humanize(): string`

Human-readable description of the cron expression.

### `toString(): string`

Returns the original expression string.

---

See the [Cron Guide](../guide/cron) for syntax reference and examples.
