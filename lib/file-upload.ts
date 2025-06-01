export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Upload failed")
  }

  const result = await response.json()
  return result.url
}

export function validateFile(file: File, maxSizeMB = 5): string | null {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
  }

  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024
  if (file.size > maxSize) {
    return `File size must be less than ${maxSizeMB}MB`
  }

  return null
}

export function getFilePreviewUrl(file: File): string {
  if (typeof window === "undefined") return ""
  return URL.createObjectURL(file)
}


// export async function uploadFile(file: File): Promise<string> {
//   const formData = new FormData()
//   formData.append("file", file)

//   const response = await fetch("/api/upload", {
//     method: "POST",
//     body: formData,
//   })

//   if (!response.ok) {
//     const error = await response.json()
//     throw new Error(error.error || "Upload failed")
//   }

//   const result = await response.json()
//   return result.url
// }

// export function validateFile(file: File, maxSizeMB = 5): string | null {
//   // Check file type
//   const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
//   if (!allowedTypes.includes(file.type)) {
//     return "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
//   }

//   // Check file size
//   const maxSize = maxSizeMB * 1024 * 1024
//   if (file.size > maxSize) {
//     return `File size must be less than ${maxSizeMB}MB`
//   }

//   return null
// }

// export function getFilePreviewUrl(file: File): string {
//   return URL.createObjectURL(file)
// }
