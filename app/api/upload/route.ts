import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import sharp from "sharp"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const aspectRatio = (formData.get("aspectRatio") as string) || "original"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/\.[^/.]+$/, "") // Remove extension
    const filename = `${timestamp}_${originalName}.webp`
    const filepath = join(uploadsDir, filename)

    // Get file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Process image with sharp
    let sharpInstance = sharp(buffer)

    // Get image metadata
    const metadata = await sharpInstance.metadata()

    // Resize based on aspect ratio
    if (aspectRatio === "1:1") {
      // Square format (1:1)
      sharpInstance = sharpInstance.resize({
        width: 800,
        height: 800,
        fit: sharp.fit.cover,
        position: sharp.strategy.attention,
      })
    } else if (aspectRatio === "3:4") {
      // 3:4 aspect ratio
      sharpInstance = sharpInstance.resize({
        width: 600,
        height: 800,
        fit: sharp.fit.cover,
        position: sharp.strategy.attention,
      })
    } else {
      // Original aspect ratio but with max dimensions
      sharpInstance = sharpInstance.resize({
        width: 800,
        height: 800,
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
    }

    // Convert to WebP with good quality and compression
    const processedImageBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer()

    // Write processed file
    await writeFile(filepath, processedImageBuffer)

    // Return the public URL
    const fileUrl = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename,
      originalSize: buffer.length,
      processedSize: processedImageBuffer.length,
      compressionRatio: Math.round((1 - processedImageBuffer.length / buffer.length) * 100),
      format: "webp",
      width: aspectRatio === "1:1" ? 800 : aspectRatio === "3:4" ? 600 : Math.min(metadata.width || 800, 800),
      height: aspectRatio === "1:1" || aspectRatio === "3:4" ? 800 : Math.min(metadata.height || 800, 800),
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}



// import { type NextRequest, NextResponse } from "next/server"
// import { writeFile, mkdir } from "fs/promises"
// import { join } from "path"
// import { existsSync } from "fs"

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData()
//     const file = formData.get("file") as File

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
//     }

//     // Validate file type
//     const allowedTypes = ["image/webp"]
//     if (!allowedTypes.includes(file.type)) {
//       return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
//     }

//     // Validate file size (5MB max)
//     const maxSize = 5 * 1024 * 1024 // 5MB
//     if (file.size > maxSize) {
//       return NextResponse.json({ error: "File too large" }, { status: 400 })
//     }

//     const bytes = await file.arrayBuffer()
//     const buffer = Buffer.from(bytes)

//     // Create uploads directory if it doesn't exist
//     const uploadsDir = join(process.cwd(), "public", "uploads")
//     if (!existsSync(uploadsDir)) {
//       await mkdir(uploadsDir, { recursive: true })
//     }

//     // Generate unique filename
//     const timestamp = Date.now()
//     const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
//     const filename = `${timestamp}_${originalName}`
//     const filepath = join(uploadsDir, filename)

//     // Write file
//     await writeFile(filepath, buffer)

//     // Return the public URL
//     const fileUrl = `/uploads/${filename}`

//     return NextResponse.json({
//       success: true,
//       url: fileUrl,
//       filename: filename,
//     })
//   } catch (error) {
//     console.error("Upload error:", error)
//     return NextResponse.json({ error: "Upload failed" }, { status: 500 })
//   }
// }

