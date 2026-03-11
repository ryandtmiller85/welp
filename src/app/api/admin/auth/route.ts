import { NextRequest, NextResponse } from 'next/server'
import { getAdminCookieName } from '@/lib/admin-auth'

// POST /api/admin/auth — login with admin secret, set session cookie
export async function POST(req: NextRequest) {
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
