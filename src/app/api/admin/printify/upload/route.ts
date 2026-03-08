import { NextRequest, NextResponse } from "next/server"
import { uploadImageBase64 } from "@/lib/printify"

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  const auth = req.headers.get("authorization")
  return auth === `Bearer ${secret}`
}

/**
 * POST /api/admin/printify/upload
 *
 * Accept a multipart file upload and forward to Printify's image upload API.
 * Returns the Printify image ID and preview URL.
 */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")

    // Upload to Printify
    const image = await uploadImageBase64(file.name, base64)

    return NextResponse.json({
      id: image.id,
      file_name: image.file_name,
      preview_url: image.preview_url,
      width: image.width,
      height: image.height,
    })
  } catch (error: any) {
    console.error("Image upload error:", error)
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    )
  }
}