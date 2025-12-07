"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const categories = ["Tous", "Films", "Séries", "Documentaires", "Comédie", "Drame", "Action", "Romance", "Thriller"]

export function CategoryFilter() {
  const [selected, setSelected] = useState("Tous")

  return (
    <div className="mb-8">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selected === category ? "default" : "outline"}
            onClick={() => setSelected(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  )
}
