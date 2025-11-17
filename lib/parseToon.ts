/**
 * parseToon.ts
 * A lightweight parser for Token-Oriented Object Notation (.toon) files.
 * 
 * Supports:
 * - Objects: { key: value, key2 = value2 }
 * - Arrays: [ item1 item2 item3 ] or [ "item1", "item2" ]
 * - Strings: double-quoted "string" or unquoted identifiers
 * - Key-value syntax: key: value OR key = value
 * - Nested structures
 * 
 * This parser is intentionally forgiving and can be extended for your specific .toon dialect.
 */

type Token = {
  type: 'identifier' | 'string' | 'punctuation' | 'eof'
  value: string
  position: number
}

/**
 * Tokenize the input string into a stream of tokens
 */
function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let position = 0

  while (position < input.length) {
    const char = input[position]

    // Skip whitespace
    if (/\s/.test(char)) {
      position++
      continue
    }

    // Skip line comments (# or //)
    if (char === '#' || (char === '/' && input[position + 1] === '/')) {
      while (position < input.length && input[position] !== '\n') {
        position++
      }
      continue
    }

    // Punctuation: { } [ ] : = ,
    if (/[{}\[\]:=,]/.test(char)) {
      tokens.push({ type: 'punctuation', value: char, position })
      position++
      continue
    }

    // Double-quoted string
    if (char === '"') {
      let value = ''
      position++ // skip opening quote
      while (position < input.length && input[position] !== '"') {
        if (input[position] === '\\' && position + 1 < input.length) {
          // Handle escape sequences
          position++
          const escaped = input[position]
          value += escaped === 'n' ? '\n' : escaped === 't' ? '\t' : escaped
        } else {
          value += input[position]
        }
        position++
      }
      if (position >= input.length) {
        throw new Error(`Unterminated string starting at position ${position}`)
      }
      position++ // skip closing quote
      tokens.push({ type: 'string', value, position })
      continue
    }

    // Identifier (unquoted word)
    if (/[a-zA-Z0-9_\-.]/.test(char)) {
      let value = ''
      const start = position
      while (position < input.length && /[a-zA-Z0-9_\-.]/.test(input[position])) {
        value += input[position]
        position++
      }
      tokens.push({ type: 'identifier', value, position: start })
      continue
    }

    throw new Error(`Unexpected character "${char}" at position ${position}`)
  }

  tokens.push({ type: 'eof', value: '', position })
  return tokens
}

/**
 * Parse tokens into a JavaScript value
 */
class Parser {
  private tokens: Token[]
  private current = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private peek(): Token {
    return this.tokens[this.current]
  }

  private consume(): Token {
    return this.tokens[this.current++]
  }

  private expect(type: Token['type'], value?: string): Token {
    const token = this.peek()
    if (token.type !== type || (value !== undefined && token.value !== value)) {
      throw new Error(
        `Expected ${type}${value ? ` "${value}"` : ''} but got ${token.type} "${token.value}" at position ${token.position}`
      )
    }
    return this.consume()
  }

  /**
   * Parse a value: string, identifier, object, or array
   */
  parseValue(): any {
    const token = this.peek()

    // String literal
    if (token.type === 'string') {
      this.consume()
      return token.value
    }

    // Object
    if (token.type === 'punctuation' && token.value === '{') {
      return this.parseObject()
    }

    // Array
    if (token.type === 'punctuation' && token.value === '[') {
      return this.parseArray()
    }

    // Identifier (unquoted string or value)
    if (token.type === 'identifier') {
      this.consume()
      // Try to parse as number if it looks like one
      if (/^-?\d+(\.\d+)?$/.test(token.value)) {
        return parseFloat(token.value)
      }
      // Boolean-like values
      if (token.value === 'true') return true
      if (token.value === 'false') return false
      if (token.value === 'null') return null
      // Otherwise treat as string
      return token.value
    }

    throw new Error(`Unexpected token ${token.type} "${token.value}" at position ${token.position}`)
  }

  /**
   * Parse an object: { key: value, key2 = value2, ... }
   */
  parseObject(): Record<string, any> {
    this.expect('punctuation', '{')
    const obj: Record<string, any> = {}

    while (this.peek().type !== 'punctuation' || this.peek().value !== '}') {
      // Parse key (identifier or string)
      const keyToken = this.consume()
      if (keyToken.type !== 'identifier' && keyToken.type !== 'string') {
        throw new Error(`Expected object key but got ${keyToken.type} at position ${keyToken.position}`)
      }
      const key = keyToken.value

      // Expect : or =
      const separator = this.peek()
      if (separator.type !== 'punctuation' || (separator.value !== ':' && separator.value !== '=')) {
        throw new Error(`Expected ":" or "=" after key "${key}" at position ${separator.position}`)
      }
      this.consume()

      // Parse value
      const value = this.parseValue()
      obj[key] = value

      // Optional comma
      if (this.peek().type === 'punctuation' && this.peek().value === ',') {
        this.consume()
      }
    }

    this.expect('punctuation', '}')
    return obj
  }

  /**
   * Parse an array: [ item1 item2 ] or [ "item1", "item2" ]
   */
  parseArray(): any[] {
    this.expect('punctuation', '[')
    const arr: any[] = []

    while (this.peek().type !== 'punctuation' || this.peek().value !== ']') {
      arr.push(this.parseValue())

      // Optional comma
      if (this.peek().type === 'punctuation' && this.peek().value === ',') {
        this.consume()
      }
    }

    this.expect('punctuation', ']')
    return arr
  }

  parse(): any {
    const value = this.parseValue()
    if (this.peek().type !== 'eof') {
      throw new Error(`Unexpected content after end of value at position ${this.peek().position}`)
    }
    return value
  }
}

/**
 * Parse a TOON string into a JavaScript object
 * @param input - The TOON format string
 * @returns Parsed JavaScript object
 * @throws Error with helpful message on parse failure
 */
export function parseToon(input: string): any {
  try {
    const tokens = tokenize(input)
    const parser = new Parser(tokens)
    return parser.parse()
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`TOON parse error: ${error.message}`)
    }
    throw error
  }
}
