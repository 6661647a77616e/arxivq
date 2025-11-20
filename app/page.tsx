"use client"

import { useState, useMemo, useEffect } from "react"
import { ChatForm } from "@/components/chat-form"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { datasets } from "@/components/data/datasets"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { DatasetEntry } from "@/components/data/datasets"
import { parseTOON } from "@/lib/parse-toon"

// Extract paper ID from arXiv URL
function extractPaperId(url: string): string | null {
  if (!url) return null
  // Match patterns like: 2511.10627v1, 2511.10627, etc.
  // Handles formats like: /html/2511.10627v1, /pdf/2511.10627, /abs/2511.10627v1
  const match = url.match(/(\d{4}\.\d{4,5})/i)
  return match ? match[1] : null
}

export default function Page() {
  const [source, setSource] = useState<string>(datasets[0]?.key ?? "obb")
  const [apiKey, setApiKey] = useState("")
  const [paperUrl, setPaperUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [override, setOverride] = useState<{ question: string; options: string[]; answer: string }[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [dynamicDatasets, setDynamicDatasets] = useState<DatasetEntry[]>([])

  // Combine static and dynamic datasets
  const allDatasets = useMemo(() => {
    return [...datasets, ...dynamicDatasets]
  }, [dynamicDatasets])

  // Handle source change - load questions for dynamic papers
  const handleSourceChange = (newSource: string) => {
    setSource(newSource)
  }

  // Sync override questions when source or dynamicDatasets change
  useEffect(() => {
    if (source.startsWith("paper-")) {
      const dataset = dynamicDatasets.find(d => d.key === source)
      if (dataset && (dataset.data as any)?.questions) {
        // Only update if the questions are different to avoid unnecessary re-renders
        setOverride((dataset.data as any).questions)
      }
      // Don't clear override if dataset not found yet - it might be in the process of being added
    } else {
      // For static datasets, clear override (they use the source prop in ChatForm)
      setOverride(null)
    }
  }, [source, dynamicDatasets])

  const handleGenerate = async () => {
    setError(null)
    setSuccessMessage(null)
    setLoading(true)
    setOverride(null)
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, url: paperUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(`${data?.error || "Generation failed"}${data?.details ? `: ${data.details}` : ""}`)
        return
      }
      let payload: any = null

      // Case 1: direct JSON with questions
      if (data?.questions) {
        payload = data
      }
      // Case 2: AI returned raw TOON
      else if (data?.raw) {
        const cleaned = (data.raw as string).replace(/```(json|toon)?/g, "").replace(/```/g, "")

        // Try TOON first
        const toonParsed = parseTOON(cleaned)
        if (toonParsed?.questions) {
          payload = toonParsed
        }
        // Fallback to JSON parsing
        else {
          try {
            const jsonParsed = JSON.parse(cleaned)
            if (jsonParsed?.questions) payload = jsonParsed
          } catch {
            payload = null
          }
        }
      }

      if (!payload?.questions) {
        setError("Invalid response format. (Neither JSON nor TOON detected.)")
        return
      }
      // Extract paper ID and add to dynamic datasets
      const paperId = extractPaperId(paperUrl)
      if (paperId) {
        const paperKey = `paper-${paperId}`
        // Check if this paper ID already exists
        const existingIndex = dynamicDatasets.findIndex(d => d.key === paperKey)
        if (existingIndex === -1) {
          // Add new dynamic dataset
          setDynamicDatasets(prev => [...prev, {
            key: paperKey,
            label: paperId,
            data: { questions: payload.questions }
          }])
        } else {
          // Update existing dataset
          setDynamicDatasets(prev => prev.map((d, idx) => 
            idx === existingIndex 
              ? { ...d, data: { questions: payload.questions } }
              : d
          ))
        }
        // Auto-select the generated paper (this will trigger useEffect to load questions)
        setSource(paperKey)
        // Set override directly - the useEffect will maintain it once the dataset is available
        setOverride(payload.questions)
      } else {
        // If no paper ID extracted, just set override
        setOverride(payload.questions)
      }
      
      // Show success message
      setSuccessMessage(`✅ Questions have been added successfully! ${paperId ? `Paper ID: ${paperId}` : ''}`)
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    } catch (e: any) {
      setError(e?.message || "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-[45rem] px-6 pt-6">
        <div className="mb-4 grid gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Google API Key</span>
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">arXiv HTML URL</span>
            <Input
              value={paperUrl}
              onChange={(e) => setPaperUrl(e.target.value)}
              placeholder="https://arxiv.org/html/2511.05375v1"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button disabled={!apiKey || !paperUrl || loading} onClick={handleGenerate}>
              {loading ? "Generating..." : "Generate MCQs"}
            </Button>
            {error ? <span className="text-red-500 text-sm">{error}</span> : null}
            {successMessage ? <span className="text-green-600 text-sm">{successMessage}</span> : null}
          </div>
        </div>
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Dataset</span>
          <Select value={source} onValueChange={handleSourceChange}> 
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select dataset" />
            </SelectTrigger>
            <SelectContent>
              {allDatasets.map((d) => (
                <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <ChatForm source={source as any} overrideQuestions={override ?? undefined} />
    </TooltipProvider>
  )
}
