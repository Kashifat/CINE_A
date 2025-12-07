import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

const schedule = [
  {
    time: "18:00 - 19:00",
    title: "Magazine Culturel",
    description: "Découverte des traditions ivoiriennes",
    status: "past",
  },
  {
    time: "19:00 - 20:00",
    title: "Série: La Famille",
    description: "Épisode 15 - Saison 2",
    status: "past",
  },
  {
    time: "20:00 - 20:30",
    title: "Journal Télévisé",
    description: "Actualités nationales et internationales",
    status: "current",
  },
  {
    time: "20:30 - 21:30",
    title: "Film: La Vie est Belle",
    description: "Comédie dramatique ivoirienne",
    status: "upcoming",
  },
  {
    time: "21:30 - 22:00",
    title: "Débat Politique",
    description: "Les enjeux de la semaine",
    status: "upcoming",
  },
  {
    time: "22:00 - 23:00",
    title: "Concert Live",
    description: "Musique africaine contemporaine",
    status: "upcoming",
  },
]

export function ProgramGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Programme du Jour
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule.map((program, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              program.status === "current" ? "bg-primary/10 border-primary" : "bg-card border-border"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{program.time}</span>
                {program.status === "current" && (
                  <Badge variant="default" className="text-xs">
                    En cours
                  </Badge>
                )}
              </div>
            </div>
            <h4 className="font-semibold mb-1">{program.title}</h4>
            <p className="text-sm text-muted-foreground">{program.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
