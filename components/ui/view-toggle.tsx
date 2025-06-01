"use client"

import { Button } from "@/components/ui/button"
import { Grid3X3, List } from "lucide-react"

interface ViewToggleProps {
  view: "table" | "card"
  onViewChange: (view: "table" | "card") => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Button
        variant={view === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("table")}
        className="h-8 w-8 p-0"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={view === "card" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("card")}
        className="h-8 w-8 p-0"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
    </div>
  )
}





// "use client"

// import { Button } from "@/components/ui/button"
// import { Grid3X3, List } from "lucide-react"

// interface ViewToggleProps {
//   view: "table" | "card"
//   onViewChange: (view: "table" | "card") => void
// }

// export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
//   return (
//     <div className="flex items-center border rounded-lg p-1">
//       <Button
//         variant={view === "table" ? "default" : "ghost"}
//         size="sm"
//         onClick={() => onViewChange("table")}
//         className="h-8 px-3"
//       >
//         <List className="h-4 w-4" />
//       </Button>
//       <Button
//         variant={view === "card" ? "default" : "ghost"}
//         size="sm"
//         onClick={() => onViewChange("card")}
//         className="h-8 px-3"
//       >
//         <Grid3X3 className="h-4 w-4" />
//       </Button>
//     </div>
//   )
// }

