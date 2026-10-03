---
'@anil-labs/snaptime': minor
---

Add a named `snaptime` export that is the same factory as the default export, so both `import snaptime from '@anil-labs/snaptime'` and `import { snaptime } from '@anil-labs/snaptime'` work. The README and documentation now use `snaptime` as the import name instead of `d8`, and stale `@anilkumarthakur/d8` package references have been replaced with `@anil-labs/snaptime`.
