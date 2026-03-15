import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const BUCKET = 'uploads'

/**
 * POST /api/upload
 *
 * Accepts a multipart file upload, stores it in Supabase Storage,
 * and returns the public URL.
 *
 * Query params:
 *   ?folder=profiles    → stores in uploads/profiles/{userId}/{uuid}.ext
 *   ?folder=items       → stores in uploads/items/{userId}/{uuid}.ext
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const folder = request.nextUrl.searchParams.get('folder') || 'general'

    // Parse multipart
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Build storage path
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `${folder}/${userId}/${randomUUID()}.${ext}`

    // Read file into buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Attempt upload — try creating bucket if it doesn't exist
    let uploadResult = await supabase.storage.from(BUCKET).upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (uploadResult.error?.message?.includes('not found') ||
        uploadResult.error?.message?.includes('does not exist')) {
      // Bucket doesn't exist — try to create it
      const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ALLOWED_TYPES,
      })

      if (bucketError) {
        console.error('Bucket creation failed:', bucketError)
        return NextResponse.json(
          {
            error: 'Storage not configured. Please create a public storage bucket named "uploads" in your Supabase dashboard (Storage → New bucket → name: uploads, public: on).',
          },
          { status: 500 }
        )
      }

      // Retry upload
      uploadResult = await supabase.storage.from(BUCKET).upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })
    }

    if (uploadResult.error) {
      console.error('Upload error:', uploadResult.error)
      return NextResponse.json(
        { error: uploadResult.error.message || 'Upload failed' },
        { status: 500 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl, path: filePath })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
