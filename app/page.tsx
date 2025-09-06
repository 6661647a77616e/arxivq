"use client"

import { useState } from "react"
import { ChatForm } from "@/components/chat-form"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { datasets } from "@/components/data/datasets"

export default function Page() {
  const [source, setSource] = useState<string>(datasets[0]?.key ?? "obb")

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-[45rem] px-6 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Dataset</span>
          <Select value={source} onValueChange={(v) => setSource(v)}> 
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select dataset" />
            </SelectTrigger>
            <SelectContent>
              {datasets.map((d) => (
                <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <ChatForm source={source as any} />
    </TooltipProvider>
  )
}
