"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Radio, Tv } from "lucide-react"

const channels = [
  {
    id: 1,
    name: "RTI 1",
    logo: "/rti-1-logo.jpg",
    country: "Côte d'Ivoire",
    category: "Généraliste",
    isLive: true,
    currentShow: "Journal Télévisé",
  },
  {
    id: 2,
    name: "RTI 2",
    logo: "/rti-2-logo.jpg",
    country: "Côte d'Ivoire",
    category: "Culture",
    isLive: true,
    currentShow: "Émission Culturelle",
  },
  {
    id: 3,
    name: "A+ Ivoire",
    logo: "/a-plus-logo.jpg",
    country: "Côte d'Ivoire",
    category: "Divertissement",
    isLive: true,
    currentShow: "Série Africaine",
  },
  {
    id: 4,
    name: "Africa 24",
    logo: "/africa-24-logo.jpg",
    country: "International",
    category: "Actualités",
    isLive: true,
    currentShow: "Actualités Africaines",
  },
  {
    id: 5,
    name: "Canal+ Afrique",
    logo: "/canal-plus-logo.jpg",
    country: "International",
    category: "Premium",
    isLive: true,
    currentShow: "Film du Soir",
  },
]

export function ChannelList() {
  const [selectedChannel, setSelectedChannel] = useState(1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tv className="h-5 w-5 text-primary" />
          Chaînes Disponibles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {channels.map((channel) => (
          <Button
            key={channel.id}
            variant={selectedChannel === channel.id ? "secondary" : "ghost"}
            className="w-full justify-start h-auto p-3"
            onClick={() => setSelectedChannel(channel.id)}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="relative">
                <img
                  src={channel.logo || "/placeholder.svg"}
                  alt={channel.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                {channel.isLive && (
                  <div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-1">
                    <Radio className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">{channel.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{channel.currentShow}</p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {channel.category}
                  </Badge>
                </div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
