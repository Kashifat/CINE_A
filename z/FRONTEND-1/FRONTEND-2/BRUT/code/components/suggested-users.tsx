import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

const users = [
  {
    name: "Ibrahim Soro",
    username: "@ibrahim_s",
    avatar: "IS",
    followers: "2.3K",
  },
  {
    name: "Aïcha Koné",
    username: "@aicha_k",
    avatar: "AK",
    followers: "1.8K",
  },
  {
    name: "Youssouf Diaby",
    username: "@youssouf_d",
    avatar: "YD",
    followers: "1.5K",
  },
]

export function SuggestedUsers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map((user) => (
          <div key={user.username} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/generic-placeholder-graphic.png?key=${user.avatar}`} />
                <AvatarFallback>{user.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.username} · {user.followers}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Suivre
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
