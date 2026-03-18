# Locale Support

D8 supports custom locales for month names, weekday names, and relative time strings. Register a locale once, and all subsequent formatting uses it.

## Registering a Locale

```typescript
import { DateFormat } from '@anilkumarthakur/d8'

DateFormat.locale('es', {
  months: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthsShort: [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ],
  weekdays: [
    'Domingo', 'Lunes', 'Martes', 'Miércoles',
    'Jueves', 'Viernes', 'Sábado'
  ],
  weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  weekdaysMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
})
```

## Using a Locale

After registering, format tokens use the locale data:

```typescript
DateFormat.locale('es') // switch to Spanish

const date = new DateFormat('2026-03-18')
date.format('dddd, MMMM Do YYYY')
// "Miércoles, Marzo 18th 2026"

date.format('ddd, MMM D')
// "Mié, Mar 18"

date.format('dd')
// "Mi"
```

## Switching Locales

```typescript
// Switch to English (default)
DateFormat.locale('en')
new DateFormat('2026-03-18').format('dddd') // "Wednesday"

// Switch to Spanish
DateFormat.locale('es')
new DateFormat('2026-03-18').format('dddd') // "Miércoles"
```

## LocaleData Interface

```typescript
interface LocaleData {
  months?: string[]        // 12 full month names
  monthsShort?: string[]   // 12 abbreviated month names
  weekdays?: string[]      // 7 full weekday names (Sun=0)
  weekdaysShort?: string[] // 7 short weekday names
  weekdaysMin?: string[]   // 7 minimal weekday names
  relativeTime?: LocaleRelativeTime
  calendar?: LocaleCalendar
}
```

### Relative Time

```typescript
interface LocaleRelativeTime {
  future: string  // e.g. "en %s"
  past: string    // e.g. "hace %s"
  s: string       // seconds
  m: string       // a minute
  mm: string      // minutes
  h: string       // an hour
  hh: string      // hours
  d: string       // a day
  dd: string      // days
  M: string       // a month
  MM: string      // months
  y: string       // a year
  yy: string      // years
}
```

### Calendar

```typescript
interface LocaleCalendar {
  sameDay?: string   // e.g. "[Hoy a las] HH:mm"
  nextDay?: string
  lastDay?: string
  nextWeek?: string
  lastWeek?: string
  sameElse?: string
}
```

## Example: French Locale

```typescript
DateFormat.locale('fr', {
  months: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ],
  monthsShort: [
    'Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
  ],
  weekdays: [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi',
    'Jeudi', 'Vendredi', 'Samedi'
  ],
})

new DateFormat('2026-03-18').format('dddd D MMMM YYYY')
// "Mercredi 18 Mars 2026"
```

## Defaults

If a locale field is not provided, D8 falls back to English defaults:
- Months: January, February, …
- Weekdays: Sunday, Monday, …
- Ordinals: 1st, 2nd, 3rd, 4th, …

## Next Steps

- [TypeScript Types](./types) — The complete type reference
- [API Reference](../api/) — All methods documented
