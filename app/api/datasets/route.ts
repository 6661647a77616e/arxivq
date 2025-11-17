import { NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { parseToon } from '@/lib/parseToon'

export type DatasetEntry = {
  key: string
  label: string
  data: unknown
}

/**
 * GET /api/datasets
 * Returns all datasets from the data/ directory (both .json and .toon files)
 */
export async function GET() {
  try {
    const dataDir = join(process.cwd(), 'data')
    
    // Read all files from data directory
    let files: string[]
    try {
      files = await readdir(dataDir)
    } catch (error) {
      // If data directory doesn't exist, return empty array
      return NextResponse.json({ datasets: [] })
    }

    const datasets: DatasetEntry[] = []

    for (const filename of files) {
      const filePath = join(dataDir, filename)
      const ext = filename.toLowerCase().split('.').pop()

      // Skip non-dataset files
      if (!ext || !['json', 'toon', 'toml'].includes(ext)) {
        continue
      }

      try {
        const content = await readFile(filePath, 'utf-8')
        let data: unknown

        if (ext === 'json') {
          data = JSON.parse(content)
        } else if (ext === 'toon' || ext === 'toml') {
          data = parseToon(content)
        } else {
          continue
        }

        // Create a key from filename (without extension)
        const key = filename.replace(/\.(json|toon|toml)$/i, '')
        
        // Create a label (capitalize first letter, replace - with space)
        const label = key
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        datasets.push({ key, label, data })
      } catch (error) {
        console.error(`Failed to parse ${filename}:`, error)
        // Continue processing other files even if one fails
      }
    }

    return NextResponse.json({ datasets })
  } catch (error) {
    console.error('Error reading datasets:', error)
    return NextResponse.json(
      { error: 'Failed to load datasets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
