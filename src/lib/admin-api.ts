import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Admin Supabase client with service role for full access
export function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Check admin auth from cookie or bearer token
export function isAdminAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false

  // Check bearer token (for API calls from existing admin pages)
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${secret}`) return true

  // Check session cookie (for new admin portal)
  const cookie = req.cookies.get('welp-admin-session')
  if (cookie?.value === secret) return true

  return false
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
