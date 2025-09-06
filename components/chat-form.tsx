"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"

import { ArrowUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"

interface QuizQuestion {
  question: string
  options: string[]
  answer: string
}

interface Message {
  role: "user" | "assistant"
  content: string
  id: string
}

// Import quiz questions from JSON files
import { datasets } from "./data/datasets"


export function ChatForm(
  { source = "obb", className, ...props }: React.ComponentProps<"form"> & { source?: string }
) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [waitingForAnswer, setWaitingForAnswer] = useState(false)

  // Build sampled questions based on selected source
  const sampledQuestions = useMemo(() => {
    const datasetEntry = datasets.find((d) => d.key === source)
    const dataset: unknown = datasetEntry?.data

    const raw: any[] = (dataset as any)?.questions ?? (dataset as any)

    const allQuestions: QuizQuestion[] = raw.map((q) => ({
      question: q.question,
      options: q.options,
      answer: Array.isArray(q.answer) ? q.answer[0] : q.answer,
    }))

    const numberToPick = Math.min(20, allQuestions.length)
    const indices = Array.from({ length: allQuestions.length }, (_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    const selected = indices.slice(0, numberToPick)
    return selected.map((i) => allQuestions[i])
  }, [source])

  // Initialize quiz
  useEffect(() => {
    if (!quizStarted) {
      const welcomeMessage: Message = {
        role: "assistant",
        content:
          "welcome to ArXiv Studies! 🔬\n\nSelect a dataset above and type anything to start!",
        id: "welcome",
      }
      setMessages([welcomeMessage])
    }
  }, [quizStarted])

  // Reset quiz when source changes
  useEffect(() => {
    setMessages([])
    setCurrentQuestion(0)
    setUserAnswers([])
    setQuizStarted(false)
    setQuizCompleted(false)
    setWaitingForAnswer(false)
  }, [source])

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      role,
      content,
      id: Date.now().toString() + Math.random(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const sendQuestion = (questionIndex: number) => {
    const question = sampledQuestions[questionIndex]
    const questionText = `Question ${questionIndex + 1} of ${sampledQuestions.length}:\n\n${question.question}\n\nA. ${question.options[0]}\nB. ${question.options[1]}\nC. ${question.options[2]}\nD. ${question.options[3]}\n\nPlease reply with A, B, C, or D:`

    setTimeout(() => {
      addMessage("assistant", questionText)
      setWaitingForAnswer(true)
    }, 1000)
  }

  const showResults = () => {
    const score = userAnswers.reduce((total, answer, index) => {
      return total + (answer === sampledQuestions[index].answer ? 1 : 0)
    }, 0)

    const percentage = Math.round((score / sampledQuestions.length) * 100)

    let resultMessage = `quiz complete\n\n your Score: ${score}/${sampledQuestions.length} (${percentage}%)\n\n`

    if (percentage >= 80) {
      resultMessage += "mantap"
    } else if (percentage >= 60) {
      resultMessage += "okay la"
    } else {
      resultMessage += "study balik"
    }

    resultMessage += "\n\n--- answer review ---\n"

    sampledQuestions.forEach((q, index) => {
      const userAnswer = userAnswers[index]
      const correctAnswer = q.answer
      const isCorrect = userAnswer === correctAnswer

      resultMessage += `\nQ${index + 1}: ${isCorrect ? "✅" : "❌"}\n`
      resultMessage += `Your answer: ${userAnswer}\n`
      if (!isCorrect) {
        resultMessage += `Correct answer: ${correctAnswer}\n`
      }
    })

    resultMessage += "\n\nwanna 'redo'?"

    setTimeout(() => {
      addMessage("assistant", resultMessage)
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const userInput = input.trim()
    addMessage("user", userInput)
    setInput("")

    // Handle restart
    if (userInput.toLowerCase() === "redo" && quizCompleted) {
      setMessages([])
      setCurrentQuestion(0)
      setUserAnswers([])
      setQuizStarted(false)
      setQuizCompleted(false)
      setWaitingForAnswer(false)
      return
    }

    // Start quiz
    if (!quizStarted) {
      setQuizStarted(true)
      setTimeout(() => {
        addMessage("assistant", "great! let's begin the quiz.")
        sendQuestion(0)
      }, 1000)
      return
    }

    // Handle quiz answers
    if (waitingForAnswer && !quizCompleted) {
      const answer = userInput.toUpperCase()

      if (!["A", "B", "C", "D"].includes(answer)) {
        setTimeout(() => {
          addMessage("assistant", "enter a valid option: A, B, C, or D")
        }, 500)
        return
      }

      // Convert letter to actual answer
      const optionIndex = answer.charCodeAt(0) - 65
      const selectedAnswer = sampledQuestions[currentQuestion].options[optionIndex]
      const correctAnswer = sampledQuestions[currentQuestion].answer

      setUserAnswers((prev) => [...prev, selectedAnswer])
      setWaitingForAnswer(false)

      // Show feedback
      const isCorrect = selectedAnswer === correctAnswer
      const feedbackMessage = isCorrect
        ? `✅ Correct! The answer is ${correctAnswer}.`
        : `❌ Incorrect. The correct answer is ${correctAnswer}.`

      setTimeout(() => {
        addMessage("assistant", feedbackMessage)

        // Move to next question or show results
        if (currentQuestion + 1 < sampledQuestions.length) {
          setCurrentQuestion(currentQuestion + 1)
          setTimeout(() => {
            sendQuestion(currentQuestion + 1)
          }, 2000)
        } else {
          setQuizCompleted(true)
          setTimeout(() => {
            showResults()
          }, 2000)
        }
      }, 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const header = (
    <header className="m-auto flex max-w-96 flex-col gap-5 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">ArXiv Physics Quiz Bot</h1>
      <p className="text-muted-foreground text-sm">
        Test your knowledge with an interactive quiz about advanced physics papers from ArXiv!
      </p>
    </header>
  )

  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {messages.map((message) => (
        <div
          key={message.id}
          data-role={message.role}
          className="max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-line data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white"
        >
          {message.content}
        </div>
      ))}
    </div>
  )

  return (
    <TooltipProvider>
      <main
        className={cn(
          "ring-none mx-auto flex h-svh max-h-svh w-full max-w-[45rem] flex-col items-stretch border-none",
          className,
        )}
        {...props}
      >
        <div className="flex-1 content-center overflow-y-auto px-6">{messages.length ? messageList : header}</div>
        <form
          onSubmit={handleSubmit}
          className="border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
        >
          <AutoResizeTextarea
            onKeyDown={handleKeyDown}
            onChange={(v) => setInput(v)}
            value={input}
            placeholder={
              !quizStarted
                ? "Type anything to start the quiz..."
                : waitingForAnswer
                  ? "Enter A, B, C, or D..."
                  : quizCompleted
                    ? "Type 'redo' to play again..."
                    : "Type your message..."
            }
            className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="absolute bottom-1 right-1 size-6 rounded-full">
                <ArrowUpIcon size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={12}>Submit</TooltipContent>
          </Tooltip>
        </form>
      </main>
    </TooltipProvider>
  )
}
