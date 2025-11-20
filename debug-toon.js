const fs = require('fs');
const YAML = require('yaml');

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

    console.log("Questions found:", parsed.questions.length);
    console.log("First question:", JSON.stringify(parsed.questions[0], null, 2));
} else {
    console.log("No questions found in parsed object");
}
    } else {
    console.log("Parse FAILED (returned null)");
}
} catch (e) {
    console.error("Error reading file:", e);
}
