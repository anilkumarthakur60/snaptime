# Plugin System

D8's `DateFormat` class can be extended with custom methods using the plugin system. Plugins let you add domain-specific functionality without modifying the library source.

## Writing a Plugin

A plugin is a function that receives the `DateFormat` class. You can add methods to its prototype:

```typescript
import { DateFormat, PluginFn } from '@anilkumarthakur/d8'

const businessHoursPlugin: PluginFn = (DF: any) => {
  DF.prototype.isBusinessHours = function () {
    const h = this.get('hour')
    return h >= 9 && h < 17 && this.isWeekday()
  }

  DF.prototype.isLunchTime = function () {
    const h = this.get('hour')
    return h >= 12 && h < 13
  }
}
```

## Registering a Plugin

```typescript
DateFormat.use(businessHoursPlugin)

// Now all DateFormat instances have the new methods
const date = new DateFormat('2026-03-18T10:30:00')
date.isBusinessHours() // true
date.isLunchTime()     // false
```

## Type-Safe Plugins with Declaration Merging

To get TypeScript support for your plugin methods, use declaration merging:

```typescript
import { DateFormat, PluginFn, DateFormatPluginMethods } from '@anilkumarthakur/d8'

// Extend the plugin methods interface
declare module '@anilkumarthakur/d8' {
  interface DateFormatPluginMethods {
    isBusinessHours(): boolean
    isLunchTime(): boolean
  }
}

const businessHoursPlugin: PluginFn = (DF: any) => {
  DF.prototype.isBusinessHours = function () {
    const h = this.get('hour')
    return h >= 9 && h < 17 && this.isWeekday()
  }

  DF.prototype.isLunchTime = function () {
    const h = this.get('hour')
    return h >= 12 && h < 13
  }
}

DateFormat.use(businessHoursPlugin)
```

Now TypeScript knows about `isBusinessHours()` and `isLunchTime()` on every `DateFormat` instance.

## Plugin Best Practices

1. **Use `this`** — Plugin methods run in the context of a `DateFormat` instance
2. **Return new instances** — For methods that modify dates, clone first: `const d = this.clone()`
3. **Don't break immutability** — Never mutate `this._d` directly
4. **Namespace if needed** — For complex plugins, create a method that returns an object

## Example: Season Plugin

```typescript
const seasonPlugin: PluginFn = (DF: any) => {
  DF.prototype.season = function () {
    const month = this.get('month')
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'autumn'
    return 'winter'
  }
}

DateFormat.use(seasonPlugin)
new DateFormat('2026-07-15').season() // "summer"
```

## Next Steps

- [Locale Support](./locale) — Customize month/weekday names
- [TypeScript Types](./types) — Understand the type system
