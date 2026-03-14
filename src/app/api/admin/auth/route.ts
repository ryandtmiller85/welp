import { NextRequest, NextResponse } from 'next/server'
import { getAdminCookieName } from '@/lib/admin-auth'
import { checkRateLimit, getRateLimitId, rateLimitResponse } from '@/lib/rate-limit'

const ADMIN_AUTH_RATE_LIMIT = { maxRequests: 5, windowMs: 5 * 60_000 } // 5 attempts per 5 minutes

// POST /api/admin/auth — login with admin secret, set session cookie
export async function POST(req: NextRequest) {
  // Rate limit by IP to prevent brute-force
  const rl = checkRateLimit(`admin-auth:${getRateLimitId(req)}`, ADMIN_AUTH_RATE_LIMIT)
  if (!rl.allowed) return rateLimitResponse(rl.resetMs)

  const { secret } = await req.json()
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret || secret !== adminSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(getAdminCookieName(), adminSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })

  return response
}

// DELETE /api/admin/auth — logout
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(getAdminCookieName())
  return response
}
