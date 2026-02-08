import { FormatTokens } from './tokens'

export class FormatEngine {
  static format(date: Date, fmt: string, isUTC: boolean): string {
    let result = fmt

    // Handle bracket-escaped text: [text] → text (literal)
    result = result.replace(/\[([^\]]*)\]/g, (_match, text) => {
      return text
    })

    // Sort tokens by length (longest first) to avoid partial matches
    const sortedTokens = Object.keys(FormatTokens.FORMAT_TOKENS).sort((a, b) => b.length - a.length)

    for (const token of sortedTokens) {
      const tokenRegex = new RegExp(token, 'g')
      const formatter = FormatTokens.FORMAT_TOKENS[token]
      if (formatter) {
        result = result.replace(tokenRegex, () => formatter(date, isUTC))
      }
    }

    return result
  }
}
