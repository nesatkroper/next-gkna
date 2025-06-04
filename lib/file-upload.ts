export async function uploadFile(file: File, options?: { aspectRatio?: "1:1" | "3:4" | "original" }): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  if (options?.aspectRatio) {
    formData.append("aspectRatio", options.aspectRatio)
  }

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

export function validateFile(file: File, maxSizeMB = 10): string | null {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"]
  if (!allowedTypes.includes(file.type)) 
    return "Please select a valid image file (JPEG, PNG, GIF, WebP, etc.)"

  const maxSize = maxSizeMB * 1024 * 1024
  if (file.size > maxSize) 
    return `File size must be less than ${maxSizeMB}MB`

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
//   if (typeof window === "undefined") return ""
//   return URL.createObjectURL(file)
// }

// export async function compressImage(file: File, aspectRatio: '3:4' | '1:1'): Promise<File> {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     const reader = new FileReader();

//     reader.onload = (e) => {
//       img.src = e.target?.result as string;

//       img.onload = () => {
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
        
//         if (!ctx) {
//           reject(new Error('Could not get canvas context'));
//           return;
//         }

//         // Set dimensions based on aspect ratio
//         let width, height;
//         if (aspectRatio === '3:4') {
//           width = 800;
//           height = 600;
//         } else {
//           width = 800;
//           height = 800;
//         }

//         // Calculate source dimensions for cropping
//         const srcAspect = img.width / img.height;
//         const targetAspect = aspectRatio === '3:4' ? 3/4 : 1;
        
//         let srcWidth, srcHeight, srcX = 0, srcY = 0;
        
//         if (srcAspect > targetAspect) {
//           // Source is wider than target
//           srcHeight = img.height;
//           srcWidth = img.height * targetAspect;
//           srcX = (img.width - srcWidth) / 2;
//         } else {
//           // Source is taller than target
//           srcWidth = img.width;
//           srcHeight = img.width / targetAspect;
//           srcY = (img.height - srcHeight) / 2;
//         }

//         canvas.width = width;
//         canvas.height = height;

//         // Draw and compress image
//         ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, width, height);

//         canvas.toBlob(
//           (blob) => {
//             if (!blob) {
//               reject(new Error('Could not create blob'));
//               return;
//             }
//             const newFile = new File([blob], `${file.name.split('.')[0]}_${aspectRatio}.webp`, {
//               type: 'image/webp',
//               lastModified: Date.now()
//             });
//             resolve(newFile);
//           },
//           'image/webp',
//           0.8 // Quality setting for WebP
//         );
//       };

//       img.onerror = () => reject(new Error('Could not load image'));
//     };

//     reader.onerror = () => reject(new Error('Could not read file'));
//     reader.readAsDataURL(file);
//   });
// }

