"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react"

const posts = [
  {
    id: 1,
    author: {
      name: "Aminata Diallo",
      username: "@aminata_d",
      avatar: "AD",
    },
    content:
      "Je viens de découvrir 'Timbuktu' et je suis complètement bouleversée. La façon dont le réalisateur capture la résistance culturelle est magistrale. Un chef-d'œuvre du cinéma africain ! 🎬",
    image: "/african-desert-movie.jpg",
    likes: 234,
    comments: 45,
    shares: 12,
    timestamp: "Il y a 2 heures",
    tags: ["Cinéma", "Timbuktu"],
  },
  {
    id: 2,
    author: {
      name: "Kofi Mensah",
      username: "@kofi_m",
      avatar: "KM",
    },
    content:
      "Quelqu'un connaît des films ivoiriens récents à recommander ? Je cherche à élargir ma collection. Merci d'avance !",
    likes: 89,
    comments: 67,
    shares: 5,
    timestamp: "Il y a 5 heures",
    tags: ["Recommandations", "Côte d'Ivoire"],
  },
  {
    id: 3,
    author: {
      name: "Fatou Traoré",
      username: "@fatou_t",
      avatar: "FT",
    },
    content:
      "Le festival du film africain d'Ouagadougou (FESPACO) approche ! Qui y va cette année ? Ce serait génial de se retrouver et discuter cinéma 🎥",
    image: "/african-film-festival.jpg",
    likes: 456,
    comments: 123,
    shares: 89,
    timestamp: "Il y a 1 jour",
    tags: ["FESPACO", "Festival", "Événement"],
  },
]

export function PostFeed() {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="pt-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={`/generic-placeholder-graphic.png?key=${post.author.avatar}`} />
                  <AvatarFallback>{post.author.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {post.author.username} · {post.timestamp}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Post Content */}
            <p className="mb-3 leading-relaxed">{post.content}</p>

            {/* Post Tags */}
            {post.tags && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Post Image */}
            {post.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt="Post content"
                  className="w-full object-cover max-h-96"
                />
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                <span>{post.shares}</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
