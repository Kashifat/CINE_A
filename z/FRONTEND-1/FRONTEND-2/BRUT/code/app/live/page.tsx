import { Header } from "@/components/header"
import { LivePlayer } from "@/components/live-player"
import { ChannelList } from "@/components/channel-list"
import { ProgramGuide } from "@/components/program-guide"

export default function LiveTVPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Chaînes en Direct</h1>
          <p className="text-muted-foreground">Regardez vos chaînes africaines préférées en direct</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Player */}
          <div className="lg:col-span-2 space-y-6">
            <LivePlayer />
            <ProgramGuide />
          </div>

          {/* Channel List */}
          <div>
            <ChannelList />
          </div>
        </div>
      </main>
    </div>
  )
}
