"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ImageIcon } from "lucide-react"

interface ImageDisplayProps {
  src?: string | null
  alt: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  fallback?: React.ReactNode
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
}

export function ImageDisplay({ src, alt, size = "md", className, fallback }: ImageDisplayProps) {
  const [imageError, setImageError] = React.useState(false)
  const [imageLoading, setImageLoading] = React.useState(true)

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  if (!src || imageError) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded border", sizeClasses[size], className)}>
        {fallback || <ImageIcon className="h-1/2 w-1/2 text-muted-foreground" />}
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden rounded border", sizeClasses[size], className)}>
      {imageLoading && <div className="absolute inset-0 bg-muted animate-pulse" />}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  )
}
