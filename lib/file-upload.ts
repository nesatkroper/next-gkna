import { uploadFileServerAction } from "@/actions/files";

// lib/file-upload.ts
export async function uploadFile(
  file: File,
  options: {
    aspectRatio?: "1:1" | "3:4" | "original";
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): Promise<string> {
  const validationError = validateFile(file, options.maxSizeMB);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("file", file);

  if (options.aspectRatio) {
    formData.append("aspectRatio", options.aspectRatio);
  }

  const result = await uploadFileServerAction(formData, {
    maxSizeMB: options.maxSizeMB,
    allowedTypes: options.allowedTypes,
    aspectRatio: options.aspectRatio,
  });

  if (!result.success || !result.url) {
    throw new Error(result.error || "Upload failed");
  }

  return result.url;
}

export function validateFile(file: File, maxSizeMB = 10): string | null {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
  ];
  if (!allowedTypes.includes(file.type)) {
    return "Please select a valid image file (JPEG, PNG, GIF, WebP, etc.)";
  }

  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return `File size must be less than ${maxSizeMB}MB`;
  }

  return null;
}

export function getFilePreviewUrl(file: File): string {
  if (typeof window === "undefined") return "";
  return URL.createObjectURL(file);
}



// export async function uploadFile(file: File, options?: { aspectRatio?: "1:1" | "3:4" | "original" }): Promise<string> {
//   const formData = new FormData()
//   formData.append("file", file)

//   if (options?.aspectRatio) {
//     formData.append("aspectRatio", options.aspectRatio)
//   }

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

// export function validateFile(file: File, maxSizeMB = 10): string | null {
//   const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"]
//   if (!allowedTypes.includes(file.type))
//     return "Please select a valid image file (JPEG, PNG, GIF, WebP, etc.)"

//   const maxSize = maxSizeMB * 1024 * 1024
//   if (file.size > maxSize)
//     return `File size must be less than ${maxSizeMB}MB`

//   return null
// }

// export function getFilePreviewUrl(file: File): string {
//   if (typeof window === "undefined") return ""
//   return URL.createObjectURL(file)
// }


