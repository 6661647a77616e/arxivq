/**
 * @jest-environment node
 */
import { GET } from './route'

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  readFile: jest.fn(),
}))

import { readdir, readFile } from 'fs/promises'

const mockReaddir = readdir as jest.MockedFunction<typeof readdir>
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>

describe('GET /api/datasets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns empty array when data directory does not exist', async () => {
    mockReaddir.mockRejectedValue(new Error('ENOENT'))

    const response = await GET()
    const data = await response.json()

    expect(data).toEqual({ datasets: [] })
  })

  it('parses JSON files correctly', async () => {
    mockReaddir.mockResolvedValue(['test.json'] as any)
    mockReadFile.mockResolvedValue(JSON.stringify({ questions: [{ question: 'Q1' }] }))

    const response = await GET()
    const data = await response.json()

    expect(data.datasets).toHaveLength(1)
    expect(data.datasets[0]).toEqual({
      key: 'test',
      label: 'Test',
      data: { questions: [{ question: 'Q1' }] }
    })
  })

  it('parses TOON files correctly', async () => {
    mockReaddir.mockResolvedValue(['example.toon'] as any)
    mockReadFile.mockResolvedValue('{ key: "value" }')

    const response = await GET()
    const data = await response.json()

    expect(data.datasets).toHaveLength(1)
    expect(data.datasets[0]).toEqual({
      key: 'example',
      label: 'Example',
      data: { key: 'value' }
    })
  })

  it('skips unsupported file types', async () => {
    mockReaddir.mockResolvedValue(['test.txt', 'test.md', 'valid.json'] as any)
    mockReadFile.mockImplementation((path) => {
      if (typeof path === 'string' && path.includes('valid.json')) {
        return Promise.resolve('{"data": "test"}')
      }
      return Promise.reject(new Error('Should not read this file'))
    })

    const response = await GET()
    const data = await response.json()

    expect(data.datasets).toHaveLength(1)
    expect(data.datasets[0].key).toBe('valid')
  })

  it('continues processing after parse error', async () => {
    mockReaddir.mockResolvedValue(['bad.json', 'good.json'] as any)
    mockReadFile.mockImplementation((path) => {
      if (typeof path === 'string' && path.includes('bad.json')) {
        return Promise.resolve('invalid json{')
      }
      return Promise.resolve('{"data": "ok"}')
    })

    const response = await GET()
    const data = await response.json()

    // Should still have the good file
    expect(data.datasets).toHaveLength(1)
    expect(data.datasets[0].key).toBe('good')
  })

  it('creates proper labels from filenames', async () => {
    mockReaddir.mockResolvedValue(['multi-word-name.json'] as any)
    mockReadFile.mockResolvedValue('{"test": true}')

    const response = await GET()
    const data = await response.json()

    expect(data.datasets[0].label).toBe('Multi Word Name')
  })
})
