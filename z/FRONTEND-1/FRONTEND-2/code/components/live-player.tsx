"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, Maximize, Settings, Radio } from "lucide-react"

export function LivePlayer() {
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([70])

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden group">
          {/* Live Stream Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/african-tv-news-broadcast.jpg" alt="Live Stream" className="w-full h-full object-cover" />
          </div>

          {/* Live Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-red-600 hover:bg-red-700 gap-1">
              <Radio className="h-3 w-3 animate-pulse" />
              EN DIRECT
            </Badge>
          </div>

          {/* Channel Info */}
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white font-semibold text-sm">RTI 1</p>
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-20" />
              </div>

              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Current Program Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">Journal Télévisé</h3>
          <p className="text-sm text-muted-foreground mb-3">20:00 - 20:30 · Actualités nationales et internationales</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full w-2/3" />
            </div>
            <span className="text-xs text-muted-foreground">20 min restantes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
