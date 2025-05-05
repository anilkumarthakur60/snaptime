import { dateFormat } from './package'

const fmt = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss'].join('-')
const now = dateFormat().utc()
const formatted = now.format(fmt)
const parsed = dateFormat.parse(formatted, fmt).utc()

console.log(formatted)
console.log(parsed)
