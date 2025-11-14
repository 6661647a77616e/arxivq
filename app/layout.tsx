
//utility function for conditional classNames
import { cn } from "@/lib/utils"

// Importint the @Inter@ font from Google Fonts via Next js
import { Inter } from "next/font/google"

// Importing the type ReactNode so we can type the children prop
import type { ReactNode } from "react"

// Importing global CSS file styles for the whole app
import "@/styles/globals.css" // Import globals.css here

// Load the inter fornt with the "latin" subset
const inter = Inter({ subsets: ["latin"] })

//Define metadata for the app (used by Next.js for <head> tags, SEO ,etc.)
export const metadata = {
  title: "arxiv quiz bot", //page title
  description: "interactive quiz chatbot for testing research paper comprehension.", //metadata description
    generator: 'v0.dev' // extra metadata field
}


//layout component that wraps all pages (Next.js 13+ convention)
//It receives a children which represent the page context
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("flex min-h-svh flex-col antialiased", inter.className)}>{children}</body>
    </html>
  )
}
