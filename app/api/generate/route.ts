export async function POST(req: Request) {
  try {
    const { apiKey, url } = await req.json() as { apiKey?: string; url?: string }
    if (!apiKey || !url) {
      return new Response(JSON.stringify({ error: "Missing apiKey or url" }), { status: 400 })
    }

    const prompt = [
      "You are to read and analyze the paper from the following link:",
      url,
      "",
      "Then, create 7 multiple-choice questions (MCQs) in JSON format based strictly on the paper’s content.",
      "",
      "Each MCQ must have one correct answer, and follow this exact structure and style:",
      `{
  "questions": [
    {
      "question": "What is the main physical system studied in the paper?",
      "options": [
        "A. Two-dimensional random-bond Ising model (±J) under bit-flip noise",
        "B. Three-dimensional Heisenberg spin glass",
        "C. One-dimensional quantum XY chain with disorder",
        "D. Four-dimensional lattice gauge theory"
      ],
      "answer": "A"
    }
  ],
  "url": "${url}"
}`,
      "",
      "Make sure to:",
      "- Use 7 questions total.",
      "- Use scientifically accurate options (not generic or made up).",
      '- Label the answers as "A", "B", "C", or "D".',
      '- Include the original "url" field at the end.',
      "Respond with JSON only. No code fences, no prose, no markdown.",
    ].join("\n")

    // Call Google Generative AI (Gemini) REST API
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ✅ use X-Goog-Api-Key header instead of ?key if you prefer
          // "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      }
    )
    

    if (!resp.ok) {
      const text = await resp.text()
      return new Response(JSON.stringify({ error: "Upstream error", details: text }), { status: 500 })
    }

    const data = await resp.json() as any
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    // Try parse as JSON; if fenced, strip
    const stripped = text.replace(/```json|```/g, "").trim()
    try {
      const parsed = JSON.parse(stripped)
      return Response.json(parsed)
    } catch {
      // Fallback: return raw text for client to handle
      return Response.json({ raw: text })
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "Unexpected error", details: e?.message }), { status: 500 })
  }
}


