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

    // Fix indentation for options and answer (hacky fix for bad YAML)
    // Assuming 4 spaces for '-' and we need 6 spaces for keys
    normalized = normalized.replace(/\n    options:/g, "\n      options:")
    normalized = normalized.replace(/\n    answer:/g, "\n      answer:")

    try {
        return YAML.parse(normalized)
    } catch (error) {
        console.warn("TOON parse failed:", error.message)
        if (error.linePos) {
            const lineNo = error.linePos[0].line
            console.log("Error at line:", lineNo)
            const lines = normalized.split('\n')
            for (let i = Math.max(0, lineNo - 5); i < Math.min(lines.length, lineNo + 5); i++) {
                console.log(`${i + 1}: ${JSON.stringify(lines[i])}`)
            }
        }
        return null
    }
}

const filePath = 'components/data/obb.toon';
try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('\t')) console.log("WARNING: File contains tabs");
    console.log(`Read ${content.length} bytes from ${filePath}`);
    const parsed = parseTOON(content);
    if (parsed && parsed.questions) {
        console.log("VERIFICATION SUCCESS: Parsed " + parsed.questions.length + " questions.");
    } else {
        console.log("VERIFICATION FAILED: Could not parse questions.");
    }
} catch (e) {
    console.error("Error reading file:", e);
}
