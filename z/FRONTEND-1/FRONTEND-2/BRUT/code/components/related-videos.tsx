import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Play } from "lucide-react"

const relatedVideos = [
  {
    id: 2,
    title: "Timbuktu",
    thumbnail: "/african-desert-movie.jpg",
    duration: "1h 36min",
  },
  {
    id: 4,
    title: "Atlantique",
    thumbnail: "/african-romance-movie.jpg",
    duration: "1h 44min",
  },
  {
    id: 6,
    title: "Lionheart",
    thumbnail: "/nigerian-movie-poster.jpg",
    duration: "1h 35min",
  },
]

export function RelatedVideos() {
  return (
    <div>
      <h3 className="font-semibold mb-4">Vidéos similaires</h3>
      <div className="space-y-4">
        {relatedVideos.map((video) => (
          <Link key={video.id} href={`/watch/${video.id}`}>
            <Card className="group overflow-hidden border-0 bg-card hover:bg-accent/50 transition-colors">
              <CardContent className="p-0">
                <div className="flex gap-3">
                  <div className="relative w-40 aspect-video overflow-hidden flex-shrink-0">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-6 w-6 text-white fill-current" />
                    </div>
                  </div>
                  <div className="py-2 pr-2 flex flex-col justify-center">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                    <p className="text-xs text-muted-foreground">{video.duration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
