# BusinessDay API

Functions for business day calculations, skipping weekends and holidays.

All functions are available as named exports and on the `d8.business` namespace.

---

## Functions

### `isBusinessDay(date, holidays?): boolean`

| Param | Type | Description |
|:------|:-----|:------------|
| `date` | `DateFormat` | Date to check |
| `holidays` | `string[]` | Optional ISO date strings to exclude |

Returns `true` if the date is Mon–Fri and not in the holidays list.

### `addBusinessDays(date, n, holidays?): DateFormat`

Add `n` business days. Supports negative `n` to go backwards.

### `subtractBusinessDays(date, n, holidays?): DateFormat`

Subtract `n` business days. Equivalent to `addBusinessDays(date, -n, holidays)`.

### `nextBusinessDay(date, holidays?): DateFormat`

Next business day after the given date.

### `prevBusinessDay(date, holidays?): DateFormat`

Previous business day before the given date.

### `businessDaysBetween(start, end, holidays?): number`

Count business days between two dates (exclusive of endpoints). Positive if `end > start`, negative otherwise.

### `getHolidays(country, year): string[]`

| Param | Type | Description |
|:------|:-----|:------------|
| `country` | `HolidayCountry \| string` | Country code |
| `year` | `number` | Calendar year |

Returns ISO date strings for public holidays.

**Supported countries:** `US`, `UK`, `IN`, `DE`, `FR`, `CA`, `AU`.

Easter-based holidays are computed dynamically using the Anonymous Gregorian algorithm.

---

See the [Business Days Guide](../guide/businessday) for examples and the full holiday list per country.
