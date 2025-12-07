import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

const topics = [
  { name: "FESPACO2025", posts: "2.5K posts" },
  { name: "CinémaAfricain", posts: "1.8K posts" },
  { name: "Nollywood", posts: "1.2K posts" },
  { name: "FilmsIvoiriens", posts: "890 posts" },
  { name: "ActeursAfricains", posts: "654 posts" },
]

export function TrendingTopics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Tendances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topics.map((topic, index) => (
          <button key={topic.name} className="w-full text-left p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between mb-1">
              <span className="font-semibold">#{topic.name}</span>
              <Badge variant="secondary" className="text-xs">
                {index + 1}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{topic.posts}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
