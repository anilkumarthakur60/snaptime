# Natural Language Examples

## Date Picker with Natural Input

```typescript
import d8 from '@anilkumarthakur/d8'

function parseUserDate(input: string): string {
  const parsed = d8.natural(input)
  if (!parsed.isValid()) {
    return `Could not understand "${input}"`
  }
  return parsed.format('dddd, MMMM Do YYYY')
}

parseUserDate('tomorrow')                    // "Thursday, March 19th 2026"
parseUserDate('next friday')                 // "March 20th 2026"
parseUserDate('in 2 weeks')                  // "April 1st 2026"
parseUserDate('3rd Monday of January 2027')  // "Monday, January 18th 2027"
parseUserDate('last day of February 2028')   // "Tuesday, February 29th 2028"
parseUserDate('end of month')                // "March 31st 2026"
parseUserDate('gibberish')                   // "Could not understand "gibberish""
```

## Reminder System

```typescript
import d8 from '@anilkumarthakur/d8'

interface Reminder {
  text: string
  when: string
}

const reminders: Reminder[] = [
  { text: 'Morning standup', when: 'tomorrow' },
  { text: 'Sprint review', when: 'next friday' },
  { text: 'Quarterly report', when: 'end of month' },
  { text: 'Annual review', when: 'first day of January 2027' },
]

for (const r of reminders) {
  const date = d8.natural(r.when)
  const countdown = date.countdown()
  console.log(`${r.text}: ${date.format('MMM D')} (${countdown.humanize()})`)
}
```

## Relative Date Navigation

```typescript
import d8 from '@anilkumarthakur/d8'

const phrases = [
  'today',
  'tomorrow',
  'yesterday',
  'next monday',
  'last friday',
  '3 days ago',
  'in 2 weeks',
  '6 months from now',
  'beginning of year',
  'end of month',
]

for (const phrase of phrases) {
  const date = d8.natural(phrase)
  console.log(`"${phrase}" → ${date.format('YYYY-MM-DD (ddd)')}`)
}
```

## Custom Reference Date

```typescript
import d8 from '@anilkumarthakur/d8'

// Plan events relative to a project start date
const projectStart = d8('2026-06-01')

const milestones = [
  { name: 'Kickoff',         when: d8.natural('today', projectStart) },
  { name: 'Design review',   when: d8.natural('in 2 weeks', projectStart) },
  { name: 'Alpha release',   when: d8.natural('in 2 months', projectStart) },
  { name: 'Beta release',    when: d8.natural('in 4 months', projectStart) },
  { name: 'Launch',          when: d8.natural('in 6 months', projectStart) },
]

for (const m of milestones) {
  console.log(`${m.name}: ${m.when.format('MMM D, YYYY')}`)
}
// Kickoff: Jun 1, 2026
// Design review: Jun 15, 2026
// Alpha release: Aug 1, 2026
// Beta release: Oct 1, 2026
// Launch: Dec 1, 2026
```
