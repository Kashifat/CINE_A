"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, Share2, Plus, Star } from "lucide-react"

export function VideoInfo({ videoId }: { videoId: string }) {
  const [rating, setRating] = useState(0)

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">La Vie est Belle</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>2023</span>
          <span>•</span>
          <span>1h 45min</span>
          <span>•</span>
          <Badge variant="secondary">Comédie</Badge>
          <Badge variant="secondary">Drame</Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ma Liste
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <ThumbsUp className="h-4 w-4" />
          J'aime
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <ThumbsDown className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Share2 className="h-4 w-4" />
          Partager
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="cast">Distribution</TabsTrigger>
          <TabsTrigger value="reviews">Avis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Synopsis</h3>
            <p className="text-muted-foreground leading-relaxed">
              Une comédie dramatique qui suit l'histoire d'un jeune homme ambitieux dans les rues animées d'Abidjan.
              Entre rêves et réalité, il découvre que la vraie richesse se trouve dans les relations humaines et la
              famille. Un film touchant qui célèbre la résilience et l'espoir face aux défis de la vie quotidienne.
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Détails</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Réalisateur:</span>
                <p className="font-medium">Kouadio N'Guessan</p>
              </div>
              <div>
                <span className="text-muted-foreground">Scénariste:</span>
                <p className="font-medium">Aminata Diallo</p>
              </div>
              <div>
                <span className="text-muted-foreground">Langue:</span>
                <p className="font-medium">Français, Nouchi</p>
              </div>
              <div>
                <span className="text-muted-foreground">Pays:</span>
                <p className="font-medium">Côte d'Ivoire</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cast" className="space-y-4">
          <div className="grid gap-4">
            {[
              { name: "Adama Koné", role: "Protagoniste", avatar: "AK" },
              { name: "Fatou Traoré", role: "Amour", avatar: "FT" },
              { name: "Ibrahim Soro", role: "Ami", avatar: "IS" },
            ].map((actor) => (
              <div key={actor.name} className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`/.jpg?height=40&width=40&query=${actor.name}`} />
                  <AvatarFallback>{actor.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{actor.name}</p>
                  <p className="text-sm text-muted-foreground">{actor.role}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Votre avis</h3>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="transition-colors">
                  <Star className={`h-6 w-6 ${star <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <Textarea placeholder="Partagez votre avis sur ce film..." className="mb-2" />
            <Button>Publier</Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Avis des spectateurs</h3>
            {[
              {
                name: "Marie Kouassi",
                rating: 5,
                comment: "Un film magnifique qui capture l'essence de la vie ivoirienne!",
                date: "Il y a 2 jours",
              },
              {
                name: "Jean Bamba",
                rating: 4,
                comment: "Très touchant et bien réalisé. Les acteurs sont excellents.",
                date: "Il y a 1 semaine",
              },
            ].map((review, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{review.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{review.name}</p>
                      <div className="flex gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
