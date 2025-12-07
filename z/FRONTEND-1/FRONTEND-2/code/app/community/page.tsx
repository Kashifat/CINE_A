import { Header } from "@/components/header"
import { PostFeed } from "@/components/post-feed"
import { CreatePost } from "@/components/create-post"
import { TrendingTopics } from "@/components/trending-topics"
import { SuggestedUsers } from "@/components/suggested-users"

export default function CommunityPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Communauté</h1>
              <p className="text-muted-foreground">Partagez et découvrez des informations culturelles</p>
            </div>

            <CreatePost />
            <PostFeed />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TrendingTopics />
            <SuggestedUsers />
          </div>
        </div>
      </main>
    </div>
  )
}
