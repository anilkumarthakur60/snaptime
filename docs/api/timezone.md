# Timezone API

Full IANA timezone support using the built-in `Intl` API.

## Constructor

```typescript
new Timezone(tz: string)
```

Throws `RangeError` if the timezone string is not a valid IANA identifier.

---

## Static Methods

### `Timezone.guess(): string`
Returns the system's local IANA timezone.

### `Timezone.isValid(tz): boolean`
Check if a timezone string is valid.

---

## Properties

| Property | Type | Description |
|:---------|:-----|:------------|
| `tz` | `string` | The IANA timezone string (readonly) |

---

## Instance Methods

### `offsetMinutes(date?): number`
UTC offset in minutes for this timezone at the given instant. Positive = east of UTC.

### `offsetString(date?): string`
Offset as `"+HH:MM"` or `"-HH:MM"`.

### `format(date, fmt): string`
Format a `DateFormat` as if the local clock were set to this timezone.

### `isDST(date?): boolean`
True if the timezone is observing Daylight Saving Time at the given date.

### `toLocalDate(date): DateFormat`
Returns a `DateFormat` (in UTC mode) whose numeric components represent the wall-clock time in this timezone.

### `toString(): string`
Returns the IANA timezone string.

---

See the [Timezone Guide](../guide/timezone) for examples.
