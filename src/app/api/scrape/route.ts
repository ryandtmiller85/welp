import { NextRequest, NextResponse } from 'next/server'
import { scrapeProductMetadata } from '@/lib/scraper'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { url } = body

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return NextResponse.json({ error: 'URL must be HTTP or HTTPS' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Scrape metadata
    const metadata = await scrapeProductMetadata(url)

    return NextResponse.json(metadata)
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 500 })
  }
}
