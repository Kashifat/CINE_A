import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Film, Tv, TrendingUp, Eye, Clock } from "lucide-react"

const stats = [
  {
    title: "Utilisateurs Actifs",
    value: "12,543",
    change: "+12.5%",
    icon: Users,
    trend: "up",
  },
  {
    title: "Films & Séries",
    value: "1,234",
    change: "+23",
    icon: Film,
    trend: "up",
  },
  {
    title: "Chaînes Live",
    value: "45",
    change: "+5",
    icon: Tv,
    trend: "up",
  },
  {
    title: "Vues Totales",
    value: "2.4M",
    change: "+18.2%",
    icon: Eye,
    trend: "up",
  },
  {
    title: "Temps de Visionnage",
    value: "45.2K hrs",
    change: "+8.7%",
    icon: Clock,
    trend: "up",
  },
  {
    title: "Taux d'Engagement",
    value: "68%",
    change: "+3.2%",
    icon: TrendingUp,
    trend: "up",
  },
]

export function AdminStats() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">{stat.change}</span> depuis le mois dernier
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
