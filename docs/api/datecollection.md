# DateCollection API

Manage and query collections of dates.

## Constructor

```typescript
new DateCollection(...dates: (DateFormat | Date | string)[])
```

## Static Methods

### `from(dates: Iterable<DateFormat | Date | string>): DateCollection`

Create from iterable.

## Instance Methods

### Modification

#### `add(...dates: (DateFormat | Date | string)[]): DateCollection`

Add dates (returns new instance).

#### `remove(predicate: (date: DateFormat) => boolean): DateCollection`

Remove matching dates.

#### `sort(compareFn?: (a: DateFormat, b: DateFormat) => number): DateCollection`

Sort dates.

### Queries

#### `filter(predicate: (date: DateFormat) => boolean): DateCollection`

Filter collection.

#### `find(predicate: (date: DateFormat) => boolean): DateFormat | undefined`

Find first matching date.

#### `map<T>(fn: (date: DateFormat) => T): T[]`

Map over dates.

#### `contains(date: DateFormat | Date | string): boolean`

#### `length(): number`

### Analysis

#### `earliest(): DateFormat`

Get earliest date.

#### `latest(): DateFormat`

Get latest date.

#### `range(): DateRange`

Get range spanning all dates.

#### `gaps(): Duration[]`

Get gaps between consecutive dates.

### Iteration

#### `toArray(): DateFormat[]`

Get as array.

See [DateCollection Guide](../guide/datecollection) for extensive examples.
