# NaturalLanguage API

Parse natural language expressions to dates.

## Static Methods

### `parse(phrase: string): DateFormat | null`

Parse natural language to date.

```typescript
const date = NaturalLanguage.parse('tomorrow at 3pm')
const date2 = NaturalLanguage.parse('next friday')
const date3 = NaturalLanguage.parse('in 2 weeks')
```

### `from(phrase: string, reference?: DateFormat): DateFormat | null`

Parse relative to reference date.

### Supported Phrases

- **Relative Days**: `today`, `tomorrow`, `yesterday`
- **Weekdays**: `next monday`, `last friday`
- **Durations**: `in 2 days`, `tomorrow at 3pm`, `next week`
- **Absolute**: `march 15`, `1/15/2024`, `2024-03-15`
- **Time**: `at 3pm`, `at 14:30`, `at 2:30am`

### Locale Support

Supports multiple languages:

- English: `tomorrow`, `yesterday`
- Spanish: `mañana`, `ayer`
- And more...

See [NaturalLanguage Guide](../guide/natural-language) for extensive examples.
