# TOON Dataset Implementation

This document describes the implementation of Token-Oriented Object Notation (.toon) support for the arxivq application.

## Overview

The application now supports loading datasets from `.toon` files in addition to the existing `.json` format. Datasets are loaded at runtime from a `/api/datasets` endpoint instead of being statically imported at build time.

## Components

### 1. TOON Parser (`lib/parseToon.ts`)

A lightweight, defensive parser for Token-Oriented Object Notation with support for:
- Objects: `{ key: value, key2 = value2 }`
- Arrays: `[ item1 item2 ]` or `[ "item1", "item2" ]`
- Key-value syntax: both `:` and `=` separators
- Strings: double-quoted or unquoted identifiers
- Comments: `#` and `//` style comments
- Nested structures
- Multiple data types: strings, numbers, booleans, null

**Test Coverage:** 14 comprehensive tests covering all features and edge cases.

### 2. Datasets API (`app/api/datasets/route.ts`)

A Next.js API route that:
- Reads files from the `data/` directory
- Parses `.json`, `.toon`, and `.toml` files
- Returns an array of dataset entries with format: `{ key, label, data }`
- Gracefully handles missing directories and parse errors
- Continues processing after individual file failures

**Test Coverage:** 6 tests covering various scenarios including error handling.

### 3. Remote Datasets Hook (`components/hooks/useRemoteDatasets.tsx`)

A React hook that:
- Fetches datasets from `/api/datasets` on component mount
- Provides `{ datasets, loading, error }` state
- Compatible with the existing `DatasetEntry` type

### 4. Page Integration (`app/page.tsx`)

Updated to:
- Import and use the `useRemoteDatasets` hook
- Merge remote datasets with static fallback datasets
- Avoid duplicates by key
- Maintain existing functionality for dynamically generated papers

### 5. Example Files

- `data/example.toon` - Example TOON format dataset
- `data/ai.json` - Example JSON format dataset
- `data/README.md` - Documentation for the data directory

## Usage

### Adding a New Dataset

1. Create a `.json` or `.toon` file in the `data/` directory
2. The filename (without extension) becomes the dataset key
3. The application automatically loads it on next page refresh

### TOON Format Example

```toon
{
  questions: [
    {
      question: "What is the answer?",
      options: ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      answer: "C"
    }
  ]
}
```

## Benefits

- **Flexible Format:** Support for both JSON and TOON formats
- **Runtime Loading:** Datasets loaded dynamically instead of at build time
- **Extensible:** Easy to add new dataset formats
- **Backward Compatible:** Existing static imports still work as fallback
- **Well Tested:** Comprehensive test coverage for parser and API

## Testing

Run tests:
```bash
npm test -- lib/parseToon.test.ts
npm test -- app/api/datasets/route.test.ts
```

All tests pass:
- 14 parser tests
- 6 API route tests

## Security

No security vulnerabilities detected by CodeQL analysis.
