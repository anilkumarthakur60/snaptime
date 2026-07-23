---
'@anil-labs/snaptime': minor
---

First release from the monorepo, carrying a full audit-fix pass with regression coverage per area:

- **Core**: quarter boundaries from month-end dates, calendar-aware `round`/`roundTo`, consistent `calendar()` day comparison, early-year ISO parsing, DST-immune `dayOfYear`. Macros are now generic over their real parameter/return types, and the unit input types (`BoundaryUnit`, `RoundToUnit`, `SettableUnit`, `Weekday`, `DateTimeLike`, …) are exported.
- **Format**: RFC 2822 / RFC 3339 / SQL serializers emit spec-shaped output; relative/calendar labels behave around clock boundaries; strict parsing rejects malformed input; locale registry resolution hardened.
- **RRule/Cron**: `BYDAY`/`BYMONTHDAY` limit (not expand) DAILY frequencies, `BYHOUR` limits HOURLY without duplicates, MONTHLY day-31/30 anchors skip short months instead of clamping, YEARLY expands the whole year.
- **Calendars/astronomy/ecosystem**: Bikram Sambat conversion edges and round-trips, equinox/solstice and sunrise/sunset tolerances, moon-phase dates, consistent Timezone/BusinessDay/NaturalLanguage behavior.
- **Packaging**: `typesVersions` mirrors the subpath exports so type resolution works under classic node module resolution too.
