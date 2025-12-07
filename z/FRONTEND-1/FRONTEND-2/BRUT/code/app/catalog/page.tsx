import { Header } from "@/components/header"
import { VideoGrid } from "@/components/video-grid"
import { CategoryFilter } from "@/components/category-filter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"

export default function CatalogPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Catalogue Vidéo</h1>
              <p className="text-muted-foreground">Découvrez notre collection de films et séries africains</p>
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher un film, une série, un acteur..." className="pl-10 h-12" />
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter />

        {/* Video Grid */}
        <VideoGrid />
      </main>
    </div>
  )
}
