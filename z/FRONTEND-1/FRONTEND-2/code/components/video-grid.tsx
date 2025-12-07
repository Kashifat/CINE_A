import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Star } from "lucide-react"

// Mock video data
const videos = [
  {
    id: 1,
    title: "La Vie est Belle",
    thumbnail: "/african-movie-poster.jpg",
    duration: "1h 45min",
    rating: 4.5,
    year: 2023,
    category: "Comédie",
  },
  {
    id: 2,
    title: "Timbuktu",
    thumbnail: "/african-desert-movie.jpg",
    duration: "1h 36min",
    rating: 4.8,
    year: 2014,
    category: "Drame",
  },
  {
    id: 3,
    title: "Queen Sono",
    thumbnail: "/african-action-series.jpg",
    duration: "6 épisodes",
    rating: 4.3,
    year: 2020,
    category: "Série",
  },
  {
    id: 4,
    title: "Atlantique",
    thumbnail: "/african-romance-movie.jpg",
    duration: "1h 44min",
    rating: 4.6,
    year: 2019,
    category: "Romance",
  },
  {
    id: 5,
    title: "Black Panther",
    thumbnail: "/wakanda-movie-poster.jpg",
    duration: "2h 14min",
    rating: 4.9,
    year: 2018,
    category: "Action",
  },
  {
    id: 6,
    title: "Lionheart",
    thumbnail: "/nigerian-movie-poster.jpg",
    duration: "1h 35min",
    rating: 4.2,
    year: 2018,
    category: "Drame",
  },
  {
    id: 7,
    title: "Rafiki",
    thumbnail: "/kenyan-movie-poster.jpg",
    duration: "1h 23min",
    rating: 4.4,
    year: 2018,
    category: "Romance",
  },
  {
    id: 8,
    title: "The Burial of Kojo",
    thumbnail: "/ghanaian-movie-poster.jpg",
    duration: "1h 20min",
    rating: 4.7,
    year: 2018,
    category: "Thriller",
  },
]

export function VideoGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {videos.map((video) => (
        <Link key={video.id} href={`/watch/${video.id}`}>
          <Card className="group overflow-hidden border-0 bg-card hover:bg-accent/50 transition-colors">
            <CardContent className="p-0">
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-primary rounded-full p-4">
                    <Play className="h-8 w-8 text-primary-foreground fill-current" />
                  </div>
                </div>
                <Badge className="absolute top-2 right-2">{video.category}</Badge>
              </div>
              <div className="p-3">
                <h3 className="font-semibold mb-1 line-clamp-1">{video.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{video.duration}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span>{video.rating}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
