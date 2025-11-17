# Dataset Files

This directory contains dataset files that are loaded at runtime by the application.

## Supported Formats

- **JSON** (`.json`) - Standard JSON format
- **TOON** (`.toon`) - Token-Oriented Object Notation format
- **TOML** (`.toml`) - Also parsed using the TOON parser

## File Structure

Dataset files should contain a `questions` array with the following structure:

```json
{
  "questions": [
    {
      "question": "What is...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A"
    }
  ]
}
```

## Example TOON Format

See `example.toon` for a sample TOON file. TOON format supports:
- Key-value pairs with `:` or `=` syntax
- Objects with `{ }`
- Arrays with `[ ]`
- Strings (quoted or unquoted identifiers)
- Comments with `#` or `//`

## Adding New Datasets

1. Create a `.json` or `.toon` file in this directory
2. The filename (without extension) will be used as the dataset key
3. The application will automatically load it on the next page load
