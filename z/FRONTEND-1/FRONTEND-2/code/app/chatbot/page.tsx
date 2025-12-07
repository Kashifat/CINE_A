import { Header } from "@/components/header"
import { ChatInterface } from "@/components/chat-interface"

export default function ChatbotPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Assistant CinéA</h1>
            <p className="text-muted-foreground">Posez-moi vos questions sur le cinéma africain</p>
          </div>

          <ChatInterface />
        </div>
      </main>
    </div>
  )
}
