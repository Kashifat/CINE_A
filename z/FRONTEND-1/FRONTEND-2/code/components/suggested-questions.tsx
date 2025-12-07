"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

const questions = [
  "Quels sont les meilleurs films africains de 2024?",
  "Recommande-moi une comédie ivoirienne",
  "Qui sont les réalisateurs africains les plus célèbres?",
  "Parle-moi du FESPACO",
  "Quels films africains ont gagné des prix internationaux?",
  "Où puis-je regarder des films en nouchi?",
]

export function SuggestedQuestions({
  onSelect,
}: {
  onSelect: (question: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4 text-primary" />
          Questions suggérées
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-2">
          {questions.map((question) => (
            <Button
              key={question}
              variant="outline"
              className="h-auto py-3 px-4 text-left justify-start whitespace-normal bg-transparent"
              onClick={() => onSelect(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
