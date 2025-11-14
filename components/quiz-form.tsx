t"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface QuizQuestion {
  question: string
  options: string[]
  answer: string
}

const quizQuestions: QuizQuestion[] = [
  {
    question:
      "A customer comes into a computer parts and service store. The customer is looking for a device to help a person with accessibility issues input instructions into a laptop by using a pen. What device should the store owner recommend to accomplish the required task?",
    options: ["stylus", "biometric scanner", "keyboard", "NFC device"],
    answer: "stylus",
  },
  {
    question: "Which component is responsible for temporarily storing data that the CPU is currently working with?",
    options: ["Hard Drive", "RAM", "Graphics Card", "Power Supply"],
    answer: "RAM",
  },
  {
    question:
      "What type of cable is commonly used to connect modern monitors to computers for high-definition video output?",
    options: ["VGA", "HDMI", "Ethernet", "USB-A"],
    answer: "HDMI",
  },
  {
    question:
      "A customer wants to upgrade their computer to run games more smoothly. Which component would have the most impact on gaming performance?",
    options: ["CPU", "Graphics Card", "Sound Card", "Network Card"],
    answer: "Graphics Card",
  },
  {
    question: "What does SSD stand for in computer storage?",
    options: ["Solid State Drive", "Super Speed Disk", "System Storage Device", "Secure Storage Drive"],
    answer: "Solid State Drive",
  },
]

export function QuizForm({ className, ...props }: React.ComponentProps<"div">) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [userInput, setUserInput] = useState("")
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showError, setShowError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const input = userInput.toUpperCase().trim()

    // Validate input (must be A, B, C, or D)
    if (!["A", "B", "C", "D"].includes(input)) {
      setShowError(true)
      return
    }

    setShowError(false)

    // Convert letter to option index
    const optionIndex = input.charCodeAt(0) - 65 // A=0, B=1, C=2, D=3
    const selectedAnswer = quizQuestions[currentQuestion].options[optionIndex]

    // Store the user's answer
    const newAnswers = [...userAnswers, selectedAnswer]
    setUserAnswers(newAnswers)
    setUserInput("")

    // Move to next question or complete quiz
    if (currentQuestion + 1 < quizQuestions.length) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setQuizCompleted(true)
    }
  }

  const calculateScore = () => {
    return userAnswers.reduce((score, answer, index) => {
      return score + (answer === quizQuestions[index].answer ? 1 : 0)
    }, 0)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setUserAnswers([])
    setUserInput("")
    setQuizCompleted(false)
    setShowError(false)
  }

  if (quizCompleted) {
    const score = calculateScore()
    const percentage = Math.round((score / quizQuestions.length) * 100)

    return (
      <main
        className={cn(
          "mx-auto flex h-svh max-h-svh w-full max-w-4xl flex-col items-center justify-center px-6",
          className,
        )}
        {...props}
      >
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-600">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-2xl font-semibold mb-4">
                Your Score: {score}/{quizQuestions.length} ({percentage}%)
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                {percentage >= 80 ? "Excellent work! 🎉" : percentage >= 60 ? "Good job! 👍" : "Keep studying! 📚"}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Review Your Answers:</h3>
              {quizQuestions.map((q, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <p className="font-medium mb-2">
                    Question {index + 1}: {q.question}
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <p className="text-green-600">✓ Correct: {q.answer}</p>
                    <p className={userAnswers[index] === q.answer ? "text-green-600" : "text-red-600"}>
                      {userAnswers[index] === q.answer ? "✓" : "✗"} Your answer: {userAnswers[index]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button onClick={resetQuiz} className="px-8 py-2">
                Take Quiz Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  const question = quizQuestions[currentQuestion]

  return (
    <main
      className={cn(
        "mx-auto flex h-svh max-h-svh w-full max-w-4xl flex-col items-center justify-center px-6",
        className,
      )}
      {...props}
    >
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Computer Hardware Quiz</CardTitle>
          <p className="text-muted-foreground">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold leading-relaxed">{question.question}</h2>

            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <span className="font-bold text-blue-600 min-w-[20px]">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-medium">
                Enter your answer (A, B, C, or D):
              </label>
              <Input
                id="answer"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type A, B, C, or D"
                className="text-center text-lg font-semibold"
                maxLength={1}
                autoFocus
              />
              {showError && <p className="text-red-600 text-sm">Please enter a valid option (A, B, C, or D)</p>}
            </div>

            <Button type="submit" className="w-full">
              {currentQuestion + 1 === quizQuestions.length ? "Finish Quiz" : "Next Question"}
            </Button>
          </form>

          <div className="flex justify-center">
            <div className="flex space-x-2">
              {quizQuestions.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-3 h-3 rounded-full",
                    index < currentQuestion
                      ? "bg-green-500"
                      : index === currentQuestion
                        ? "bg-blue-500"
                        : "bg-gray-300",
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
