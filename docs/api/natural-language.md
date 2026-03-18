# Natural Language API

Parse dates from English phrases.

## Function

```typescript
parseNatural(input: string, ref?: DateFormat): DateFormat
```

Also available as `d8.natural(input, ref?)`.

| Param | Type | Default | Description |
|:------|:-----|:--------|:------------|
| `input` | `string` | — | English phrase to parse |
| `ref` | `DateFormat` | `new DateFormat()` | Reference date for relative calculations |

**Returns** a `DateFormat`. Returns an invalid `DateFormat` (`.isValid() === false`) if the input cannot be parsed.

---

## Supported Patterns

| Pattern | Example |
|:--------|:--------|
| `now` / `today` | Current moment |
| `tomorrow` | +1 day |
| `yesterday` | -1 day |
| `next {weekday}` | `next friday` |
| `last {weekday}` | `last wednesday` |
| `next week/month/year` | `next month` |
| `last week/month/year` | `last year` |
| `{N} days/weeks/months/years ago` | `3 days ago` |
| `in {N} days/weeks/months/years` | `in 2 weeks` |
| `{N} days/weeks/months/years from now` | `5 days from now` |
| `beginning of day/week/month/year` | `beginning of month` |
| `end of day/week/month/year` | `end of year` |
| `first day of {month} [year]` | `first day of March 2027` |
| `last day of {month} [year]` | `last day of February` |
| `{N}th {weekday} of {month} [year]` | `3rd Friday of January` |

**Weekdays:** Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.

**Months:** January through December.

**Units:** day(s), week(s), month(s), year(s).

---

See the [Natural Language Guide](../guide/natural-language) for detailed examples.
