"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User } from "lucide-react"
import { SuggestedQuestions } from "@/components/suggested-questions"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Bonjour! Je suis votre assistant CinéA. Je peux vous aider à découvrir des films africains, vous donner des informations sur les acteurs, réalisateurs, et bien plus encore. Comment puis-je vous aider aujourd'hui?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getSimulatedResponse(input),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-4">
      {/* Chat Messages */}
      <Card className="h-[500px] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback>
                  {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-3 bg-muted">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Suggested Questions */}
      {messages.length === 1 && <SuggestedQuestions onSelect={handleSuggestedQuestion} />}

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px] flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getSimulatedResponse(input: string): string {
  const lowerInput = input.toLowerCase()

  if (lowerInput.includes("recommand") || lowerInput.includes("film")) {
    return "Je vous recommande 'Timbuktu' d'Abderrahmane Sissako, un chef-d'œuvre qui a remporté de nombreux prix internationaux. C'est un film poignant qui explore la vie sous l'occupation djihadiste au Mali. Si vous aimez les drames, 'Atlantique' de Mati Diop est également excellent - c'est le premier film d'une réalisatrice africaine à être en compétition à Cannes!"
  }

  if (lowerInput.includes("acteur") || lowerInput.includes("actrice")) {
    return "Le cinéma africain regorge de talents exceptionnels! Parmi les acteurs les plus reconnus, on trouve Idris Elba (britannique d'origine africaine), Lupita Nyong'o (kényane), et Djimon Hounsou (béninois). En Côte d'Ivoire, des acteurs comme Isaach de Bankolé ont une carrière internationale impressionnante."
  }

  if (lowerInput.includes("ivoir") || lowerInput.includes("côte")) {
    return "Le cinéma ivoirien est très dynamique! Des films comme 'Run' de Philippe Lacôte ont été présentés dans les plus grands festivals. La Côte d'Ivoire a une longue tradition cinématographique et continue de produire des œuvres remarquables qui mélangent tradition et modernité."
  }

  if (lowerInput.includes("festival") || lowerInput.includes("fespaco")) {
    return "Le FESPACO (Festival Panafricain du Cinéma et de la Télévision de Ouagadougou) est le plus grand festival de cinéma africain au monde! Il a lieu tous les deux ans au Burkina Faso et célèbre le meilleur du cinéma africain. C'est un événement incontournable pour découvrir les nouvelles productions et rencontrer les professionnels du secteur."
  }

  return "C'est une excellente question! Le cinéma africain est riche et diversifié, avec des histoires uniques qui méritent d'être découvertes. N'hésitez pas à explorer notre catalogue pour trouver des films qui correspondent à vos goûts. Je peux vous aider à trouver des films par genre, pays, ou réalisateur si vous le souhaitez!"
}
