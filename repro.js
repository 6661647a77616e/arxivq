const YAML = require('yaml');

const input = `
questions: items[1]:
    - question: What main theoretical frameworks are explored in this paper?
    options: items[4]:
        - Loop Quantum Gravity and String Theory
        - f(R)-gravity and Ricci-Inverse (RI)-gravity
    answer: f(R)-gravity and Ricci-Inverse (RI)-gravity
`;

function parseTOON(text) {
    if (!text) return null

    let normalized = text.replace(/\r\n/g, "\n")

    // Remove code fences (```json ... ```)
    normalized = normalized.replace(/```[\s\S]*?```/g, block =>
        block.replace(/```(json|toon)?/g, "").replace(/```/g, "")
    )

    // Remove TOON-specific "items[n]:" metadata (keeps the colon when attached to keys)
    normalized = normalized.replace(/:\s*items\[\d+\]:/g, ":")
    normalized = normalized.replace(/items\[\d+\]:/g, "")

    console.log("--- Pre-indent fix ---");
    console.log(normalized);

    // Fix indentation for options and answer (hacky fix for bad YAML)
    // Assuming 4 spaces for '-' and we need 6 spaces for keys
    normalized = normalized.replace(/\n    options:/g, "\n      options:")
    normalized = normalized.replace(/\n    answer:/g, "\n      answer:")

    console.log("--- Post-indent fix ---");
    console.log(normalized);

    try {
        return YAML.parse(normalized)
    } catch (error) {
        console.warn("TOON parse failed:", error.message)
        return null
    }
}

const parsed = parseTOON(input);
if (parsed) {
    console.log("SUCCESS:", JSON.stringify(parsed, null, 2));
} else {
    console.log("FAILURE");
}
