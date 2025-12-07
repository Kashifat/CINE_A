import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Film, Users, MessageSquare, Tv, Play } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "video",
    user: "Aminata Diallo",
    avatar: "AD",
    action: "a regardé",
    target: "La Vie est Belle",
    time: "Il y a 5 minutes",
    icon: Play,
  },
  {
    id: 2,
    type: "comment",
    user: "Kofi Mensah",
    avatar: "KM",
    action: "a commenté",
    target: "Timbuktu",
    time: "Il y a 15 minutes",
    icon: MessageSquare,
  },
  {
    id: 3,
    type: "subscription",
    user: "Fatou Traoré",
    avatar: "FT",
    action: "s'est abonné à",
    target: "Premium",
    time: "Il y a 1 heure",
    icon: Users,
  },
  {
    id: 4,
    type: "live",
    user: "Ibrahim Soro",
    avatar: "IS",
    action: "regarde",
    target: "RTI 1 en direct",
    time: "Il y a 2 heures",
    icon: Tv,
  },
  {
    id: 5,
    type: "upload",
    user: "Admin",
    avatar: "A",
    action: "a ajouté",
    target: "Atlantique",
    time: "Il y a 3 heures",
    icon: Film,
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/generic-placeholder-graphic.png?key=${activity.avatar}`} />
                  <AvatarFallback>{activity.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {activity.type}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
