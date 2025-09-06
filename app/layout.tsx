import { cn } from "@/lib/utils"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import "@/styles/globals.css" // Import globals.css here

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "arxiv quiz bot",
  description: "interactive quiz chatbot for testing research paper comprehension.",
    generator: 'v0.dev'
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("flex min-h-svh flex-col antialiased", inter.className)}>{children}</body>
    </html>
  )
}
