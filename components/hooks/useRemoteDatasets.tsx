"use client"

import { useState, useEffect } from "react"
import type { DatasetEntry } from "@/components/data/datasets"

export type UseRemoteDatasetsResult = {
  datasets: DatasetEntry[]
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch datasets from the /api/datasets endpoint at runtime
 * Compatible with the DatasetEntry type used throughout the app
 */
export function useRemoteDatasets(): UseRemoteDatasetsResult {
  const [datasets, setDatasets] = useState<DatasetEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDatasets() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/datasets')
        if (!response.ok) {
          throw new Error(`Failed to fetch datasets: ${response.status}`)
        }
        
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        
        setDatasets(data.datasets || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setDatasets([])
      } finally {
        setLoading(false)
      }
    }

    fetchDatasets()
  }, [])

  return { datasets, loading, error }
}
