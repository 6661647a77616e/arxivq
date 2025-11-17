import { parseToon } from './parseToon'

describe('parseToon', () => {
  it('parses simple object with colon syntax', () => {
    const input = `{ key: "value", number: 42 }`
    const result = parseToon(input)
    expect(result).toEqual({ key: 'value', number: 42 })
  })

  it('parses object with equals syntax', () => {
    const input = `{ key = "value", flag = true }`
    const result = parseToon(input)
    expect(result).toEqual({ key: 'value', flag: true })
  })

  it('parses arrays with strings', () => {
    const input = `{ items: ["A", "B", "C"] }`
    const result = parseToon(input)
    expect(result).toEqual({ items: ['A', 'B', 'C'] })
  })

  it('parses arrays with identifiers', () => {
    const input = `{ options: [opt1 opt2 opt3] }`
    const result = parseToon(input)
    expect(result).toEqual({ options: ['opt1', 'opt2', 'opt3'] })
  })

  it('parses nested objects', () => {
    const input = `{
      outer: {
        inner: "value"
      }
    }`
    const result = parseToon(input)
    expect(result).toEqual({ outer: { inner: 'value' } })
  })

  it('handles comments', () => {
    const input = `{
      # This is a comment
      key: "value" // another comment
    }`
    const result = parseToon(input)
    expect(result).toEqual({ key: 'value' })
  })

  it('parses boolean values', () => {
    const input = `{ flag1: true, flag2: false }`
    const result = parseToon(input)
    expect(result).toEqual({ flag1: true, flag2: false })
  })

  it('parses null value', () => {
    const input = `{ empty: null }`
    const result = parseToon(input)
    expect(result).toEqual({ empty: null })
  })

  it('parses numbers', () => {
    const input = `{ int: 42, float: 3.14, negative: -10 }`
    const result = parseToon(input)
    expect(result).toEqual({ int: 42, float: 3.14, negative: -10 })
  })

  it('handles escaped characters in strings', () => {
    const input = `{ text: "Line 1\\nLine 2\\tTabbed" }`
    const result = parseToon(input)
    expect(result).toEqual({ text: 'Line 1\nLine 2\tTabbed' })
  })

  it('throws error on unterminated string', () => {
    const input = `{ key: "unterminated }`
    expect(() => parseToon(input)).toThrow(/Unterminated string/)
  })

  it('throws error on unexpected character', () => {
    const input = `{ key: @ }`
    expect(() => parseToon(input)).toThrow(/Unexpected character/)
  })

  it('throws error on missing value', () => {
    const input = `{ key: }`
    expect(() => parseToon(input)).toThrow()
  })

  it('parses complex dataset structure', () => {
    const input = `{
      questions: [
        {
          question: "What is 2+2?",
          options: ["A. 3", "B. 4", "C. 5", "D. 6"],
          answer: "B"
        },
        {
          question: "What is the capital of France?",
          options: ["A. London", "B. Berlin", "C. Paris", "D. Rome"],
          answer: "C"
        }
      ]
    }`
    const result = parseToon(input)
    expect(result).toEqual({
      questions: [
        {
          question: 'What is 2+2?',
          options: ['A. 3', 'B. 4', 'C. 5', 'D. 6'],
          answer: 'B'
        },
        {
          question: 'What is the capital of France?',
          options: ['A. London', 'B. Berlin', 'C. Paris', 'D. Rome'],
          answer: 'C'
        }
      ]
    })
  })
})
