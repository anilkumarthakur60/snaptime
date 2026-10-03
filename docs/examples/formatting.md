# Formatting Examples

## Basic Tokens

```typescript
import snaptime from '@anil-labs/snaptime'

const d = snaptime('2026-01-15T14:30:45.123Z')

d.format('YYYY-MM-DD')         // → "2026-01-15"
d.format('YY-MM-DD')           // → "26-01-15"
d.format('MMMM Do, YYYY')      // → "January 15th, 2026"
d.format('MMM D, YYYY')        // → "Jan 15, 2026"
d.format('dddd, MMMM D YYYY')  // → "Thursday, January 15 2026"
d.format('ddd')                 // → "Thu"
d.format('dd')                  // → "Th"
d.format('d')                   // → "4"
```

## Time Formatting

```typescript
const d = snaptime('2026-01-15T14:30:45Z')

d.format('HH:mm:ss')    // → "14:30:45"
d.format('hh:mm:ss A')  // → "02:30:45 PM"
d.format('h:mm a')       // → "2:30 pm"

// Edge cases:
snaptime('2026-01-15T00:00:00Z').format('hh:mm A')  // → "12:00 AM" (midnight)
snaptime('2026-01-15T12:00:00Z').format('hh:mm A')  // → "12:00 PM" (noon)
snaptime('2026-01-15T01:00:00Z').format('h:mm A')   // → "1:00 AM"
```

## Ordinals

```typescript
snaptime('2026-01-01T00:00:00Z').format('Do')  // → "1st"
snaptime('2026-01-02T00:00:00Z').format('Do')  // → "2nd"
snaptime('2026-01-03T00:00:00Z').format('Do')  // → "3rd"
snaptime('2026-01-04T00:00:00Z').format('Do')  // → "4th"
snaptime('2026-01-11T00:00:00Z').format('Do')  // → "11th" (not 11st!)
snaptime('2026-01-12T00:00:00Z').format('Do')  // → "12th" (not 12nd!)
snaptime('2026-01-13T00:00:00Z').format('Do')  // → "13th" (not 13rd!)
snaptime('2026-01-21T00:00:00Z').format('Do')  // → "21st"

snaptime('2026-01-01T00:00:00Z').format('Mo')  // → "1st"
snaptime('2026-02-01T00:00:00Z').format('Mo')  // → "2nd"
snaptime('2026-03-01T00:00:00Z').format('Mo')  // → "3rd"
snaptime('2026-11-01T00:00:00Z').format('Mo')  // → "11th"
```

## ISO Week / Day of Year

```typescript
snaptime('2026-01-15T12:00:00Z').format('WW')   // → "02"
snaptime('2026-01-15T12:00:00Z').format('W')    // → "2"
snaptime('2026-01-15T12:00:00Z').format('DDD')  // → "15"
snaptime('2026-01-15T12:00:00Z').format('DDDD') // → "015"
snaptime('2026-01-15T12:00:00Z').format('gg')   // → "2026"
snaptime('2026-01-15T12:00:00Z').format('Q')    // → "1"
```

## Unix Timestamps

```typescript
const d = snaptime('2026-01-15T12:00:00Z')

d.format('X')  // → Unix seconds (e.g. "1768483200")
d.format('x')  // → Unix milliseconds (e.g. "1768483200000")
```

## Intl Formatting

```typescript
const d = snaptime('2026-01-15T12:00:00Z')

d.formatIntl({
  weekday: 'long', year: 'numeric', month: 'long',
  day: 'numeric', timeZone: 'UTC'
})
// → "Thursday, January 15, 2026"

d.formatIntl({ dateStyle: 'full', timeZone: 'UTC' })
// → "Thursday, January 15, 2026" (locale-dependent)
```

## Serialization Formats

```typescript
const d = snaptime('2026-01-15T12:00:00.000Z')

d.toISOString() // → "2026-01-15T12:00:00.000Z"
d.toSQL()       // → "2026-01-15 12:00:00"
d.toSQLDate()   // → "2026-01-15"
d.toSQLTime()   // → "12:00:00"
d.toRFC2822()   // → "Thu, 15 Jan 2026 12:00:00 +0000"
d.toRFC3339()   // → "2026-01-15T12:00:00Z"
d.toExcel()     // → ~46031
d.toJSON()      // → "2026-01-15T12:00:00.000Z"
d.toMillis()    // → 1768483200000
d.toObject()    // → { year: 2026, month: 1, date: 15, hour: 12, minute: 0, second: 0, millisecond: 0 }
```

## Custom Locale

```typescript
import { DateFormat } from '@anil-labs/snaptime'

DateFormat.locale('fr', {
  months: ['Janvier','Février','Mars','Avril','Mai','Juin',
           'Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  weekdays: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
})
DateFormat.locale('fr')

snaptime('2026-01-15T12:00:00Z').format('MMMM') // → "Janvier"
snaptime('2026-01-15T12:00:00Z').format('dddd') // → "Jeudi"

DateFormat.locale('en') // reset
```

## Escape Brackets

```js
snaptime('2026-03-15').format('[Year:] YYYY [Month:] MM')
// "Year: 2026 Month: 03"

snaptime('2026-03-15').format('[Today is] dddd')
// "Today is Sunday"

snaptime('2026-01-01').format('YYYY [is a] dddd')
// "2026 is a Thursday"
```
