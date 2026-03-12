import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/admin-api'
import { z } from 'zod'

const feedbackSchema = z.object({
  page_url: z.string().max(2000),
  page_title: z.string().max(200).optional(),
  category: z.enum(['bug', 'confusion', 'suggestion', 'praise', 'general']).default('general'),
  description: z.string().trim().min(1).max(5000),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  screenshot_data: z.string().max(5_000_000).optional().nullable(), // ~3.7MB base64 image
  tester_email: z.string().email().max(320).optional().nullable(),
  tester_name: z.string().max(100).optional().nullable(),
  user_agent: z.string().max(500).optional(),
  viewport_width: z.number().int().optional(),
  viewport_height: z.number().int().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = feedbackSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return NextResponse.json(
        { error: `${firstError.path.join('.')}: ${firstError.message}` },
        { status: 400 }
      )
    }

    const supabase = getAdminSupabase()

    const { error } = await supabase
      .from('test_feedback')
      .insert(parsed.data)

    if (error) {
      console.error('Failed to save feedback:', error)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Feedback API error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    )
  }
}

// GET: admin can fetch all feedback
export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminSupabase()
  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const category = url.searchParams.get('category')

  let query = supabase
    .from('test_feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ feedback: data })
}
