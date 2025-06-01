"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { validateFile, getFilePreviewUrl } from "@/lib/file-upload"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  maxSize?: number // in MB
  preview?: boolean
  value?: File | null
  placeholder?: string
  className?: string
}

export function FileUpload({
  onFileSelect,
  accept = "image/*",
  maxSize = 5,
  preview = true,
  value,
  placeholder = "Click to upload or drag and drop",
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (value && preview) {
      setPreviewUrl(getFilePreviewUrl(value))
    } else {
      setPreviewUrl(null)
    }
  }, [value, preview])

  const handleFile = (file: File) => {
    setError(null)

    const validationError = validateFile(file, maxSize)
    if (validationError) {
      setError(validationError)
      return
    }

    onFileSelect(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    onFileSelect(null)
    setPreviewUrl(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          error ? "border-destructive" : "",
          "hover:border-primary/50 hover:bg-primary/5",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {previewUrl ? (
          <div className="flex items-center justify-center">
            <div className="relative">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Preview"
                className="max-w-full max-h-32 rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeFile}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">{placeholder}</p>
            <p className="text-xs text-muted-foreground">Max file size: {maxSize}MB</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {value && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>{value.name}</span>
          <span>({(value.size / 1024 / 1024).toFixed(2)} MB)</span>
        </div>
      )}
    </div>
  )
}



// "use client"

// import * as React from "react"
// import { Upload, X, File, ImageIcon } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"

// interface FileUploadProps {
//   onFileSelect: (file: File | null) => void
//   accept?: string
//   maxSize?: number // in MB
//   preview?: boolean
//   className?: string
//   placeholder?: string
//   value?: File | string | null
// }

// export function FileUpload({
//   onFileSelect,
//   accept = "image/*",
//   maxSize = 5,
//   preview = true,
//   className,
//   placeholder = "Click to upload or drag and drop",
//   value,
// }: FileUploadProps) {
//   const [dragActive, setDragActive] = React.useState(false)
//   const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
//   const inputRef = React.useRef<HTMLInputElement>(null)

//   React.useEffect(() => {
//     if (value && typeof value === 'object' && 'size' in value && 'type' in value) {
//       // Likely a File object
//       const url = URL.createObjectURL(value as File)
//       setPreviewUrl(url)
//       return () => URL.revokeObjectURL(url)
//     } else if (typeof value === "string" && value) {
//       setPreviewUrl(value)
//     } else {
//       setPreviewUrl(null)
//     }
//   }, [value])

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true)
//     } else if (e.type === "dragleave") {
//       setDragActive(false)
//     }
//   }

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setDragActive(false)

//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleFile(e.dataTransfer.files[0])
//     }
//   }

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     e.preventDefault()
//     if (e.target.files && e.target.files[0]) {
//       handleFile(e.target.files[0])
//     }
//   }

//   const handleFile = (file: File) => {
//     if (file.size > maxSize * 1024 * 1024) {
//       alert(`File size must be less than ${maxSize}MB`)
//       return
//     }
//     onFileSelect(file)
//   }

//   const removeFile = () => {
//     onFileSelect(null)
//     if (inputRef.current) {
//       inputRef.current.value = ""
//     }
//   }

//   const isImage = accept.includes("image")

//   return (
//     <div className={cn("w-full", className)}>
//       <div
//         className={cn(
//           "relative border-2 border-dashed rounded-lg p-6 transition-colors",
//           dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
//           "hover:border-primary hover:bg-primary/5",
//         )}
//         onDragEnter={handleDrag}
//         onDragLeave={handleDrag}
//         onDragOver={handleDrag}
//         onDrop={handleDrop}
//       >
//         <input
//           ref={inputRef}
//           type="file"
//           accept={accept}
//           onChange={handleChange}
//           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//         />

//         {previewUrl && preview ? (
//           <div className="relative">
//             {isImage ? (
//               <img
//                 src={previewUrl || "/placeholder.svg"}
//                 alt="Preview"
//                 className="max-h-48 mx-auto rounded-lg object-cover"
//               />
//             ) : (
//               <div className="flex items-center justify-center p-4">
//                 <File className="h-12 w-12 text-muted-foreground" />
//               </div>
//             )}
//             <Button
//               type="button"
//               variant="destructive"
//               size="sm"
//               className="absolute top-2 right-2"
//               onClick={removeFile}
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         ) : (
//           <div className="text-center">
//             <div className="mx-auto h-12 w-12 text-muted-foreground">
//               {isImage ? <ImageIcon className="h-full w-full" /> : <Upload className="h-full w-full" />}
//             </div>
//             <div className="mt-4">
//               <p className="text-sm text-muted-foreground">{placeholder}</p>
//               <p className="text-xs text-muted-foreground mt-1">Max file size: {maxSize}MB</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
