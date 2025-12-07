import { Header } from "@/components/header"
import { VideoPlayer } from "@/components/video-player"
import { VideoInfo } from "@/components/video-info"
import { RelatedVideos } from "@/components/related-videos"

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-6">
        {/* Video Player */}
        <VideoPlayer videoId={id} />

        {/* Video Information */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <VideoInfo videoId={id} />
          </div>
          <div>
            <RelatedVideos />
          </div>
        </div>
      </main>
    </div>
  )
}
