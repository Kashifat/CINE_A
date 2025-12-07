import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Film, Users, Tv, MessageSquare, Star, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-balance">Découvrez le Cinéma Africain</h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 text-pretty">
                La première plateforme de streaming dédiée au cinéma africain et ivoirien. Films, séries, documentaires
                et chaînes en direct.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Commencer Gratuitement
                  </Button>
                </Link>
                <Link href="/catalog">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                    Explorer le Catalogue
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">Tout ce dont vous avez besoin</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <Film className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Catalogue Riche</h3>
                  <p className="text-muted-foreground">
                    Des centaines de films africains et internationaux à découvrir
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Communauté</h3>
                  <p className="text-muted-foreground">Partagez et découvrez des informations culturelles</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Tv className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Chaînes Live</h3>
                  <p className="text-muted-foreground">Accédez aux chaînes africaines en direct</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <MessageSquare className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Assistant IA</h3>
                  <p className="text-muted-foreground">Un chatbot intelligent pour vous guider</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Star className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Avis & Notes</h3>
                  <p className="text-muted-foreground">Partagez votre opinion sur les films</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <TrendingUp className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Tendances</h3>
                  <p className="text-muted-foreground">Suivez les films les plus populaires</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Prêt à découvrir le cinéma africain ?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Rejoignez des milliers de cinéphiles et explorez la richesse du cinéma africain
              </p>
              <Link href="/signup">
                <Button size="lg">Créer un compte gratuit</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 CinéA. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
