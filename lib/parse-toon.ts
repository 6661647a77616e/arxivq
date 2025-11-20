import { parse as parseYAML } from "yaml"

/**
 * Convert TOON/YAML-like text into a JS object.
 * Strips code fences, normalizes carriage returns and removes TOON-specific markers like items[n]:.
 */
export function parseTOON(text: string): any {
  if (!text) return null

  let normalized = text.replace(/\r\n/g, "\n")

  // Remove code fences (```json ... ```)
  normalized = normalized.replace(/```[\s\S]*?```/g, block =>
    block.replace(/```(json|toon)?/g, "").replace(/```/g, "")
  )

  // Remove TOON-specific "items[n]:" metadata (keeps the colon when attached to keys)
  normalized = normalized.replace(/:\s*items\[\d+\]:/g, ":")
  normalized = normalized.replace(/items\[\d+\]:/g, "")

  // Fix indentation for options and answer (hacky fix for bad YAML)
  // Assuming 4 spaces for '-' and we need 6 spaces for keys
  normalized = normalized.replace(/\n    options:/g, "\n      options:")
  normalized = normalized.replace(/\n    answer:/g, "\n      answer:")

  try {
    return parseYAML(normalized)
  } catch (error) {
    console.warn("TOON parse failed:", error, "\nInput:", text, "\nNormalized:", normalized)
    return null
  }
}

/**
 * Extract questions array from a parsed TOON payload.
 */
export function extractQuestions(parsed: any): { question: string; options: string[]; answer: string }[] {
  if (!parsed) return []
  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(parsed?.questions)) return parsed.questions
  return []
}


