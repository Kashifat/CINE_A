import Link from "next/link"
import { Film, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">CinéA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/catalog" className="text-sm font-medium hover:text-primary transition-colors">
            Catalogue
          </Link>
          <Link href="/community" className="text-sm font-medium hover:text-primary transition-colors">
            Communauté
          </Link>
          <Link href="/live" className="text-sm font-medium hover:text-primary transition-colors">
            Live TV
          </Link>
          <Link href="/chatbot" className="text-sm font-medium hover:text-primary transition-colors">
            Assistant
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher..." className="w-64" />
          </div>
          <Link href="/login">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
