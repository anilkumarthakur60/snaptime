# Duration API

Time span representation with conversion, arithmetic, formatting, and humanization.

## Constructor

```typescript
new Duration(ms?: number)
```

| Param | Type | Default | Description |
|:------|:-----|:--------|:------------|
| `ms` | `number` | `0` | Duration in milliseconds |

---

## Static Methods

### `Duration.parse(input): Duration`

Parse a duration string.

```typescript
Duration.parse('2h30m15s')   // 2 hours, 30 min, 15 sec
Duration.parse('1Y6M')       // 1 year, 6 months
Duration.parse('500ms')      // 500 milliseconds
```

**Tokens:** `Y/y` (years), `M` (months), `w` (weeks), `d` (days), `h` (hours), `m` (minutes), `s` (seconds), `ms` (milliseconds).

---

## Instance Methods

### `as(unit): number`

Convert this duration to the given unit.

### `add(n, unit): Duration`

Add time to this duration. Returns a new `Duration`.

### `subtract(n, unit): Duration`

Subtract time. Returns a new `Duration`.

### `humanize(short?): string`

| Param | Type | Default | Description |
|:------|:-----|:--------|:------------|
| `short` | `boolean` | `true` | `true`: compact (`"3h"`). `false`: long (`"2 hours, 30 minutes"`) |

### `format(fmt): string`

Format with template tokens: `HH`, `H`, `mm`, `m`, `ss`, `s`, `SSS`.

### `toMilliseconds(): number`
### `toSeconds(): number`
### `toMinutes(): number`
### `toHours(): number`
### `toDays(): number`

### `valueOf(): number`
Raw milliseconds.

### `isZero(): boolean`
### `isNegative(): boolean`

### `abs(): Duration`
Absolute value.

### `toString(): string`
Same as `humanize(true)`.

---

See the [Duration Guide](../guide/duration) for examples.
