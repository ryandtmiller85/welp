import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const response = NextResponse.redirect(`${requestUrl.origin}/`)

  // Delete all Supabase auth cookies by setting maxAge to 0.
  // The server Supabase client's setAll is a no-op, so we must
  // clear cookies directly on the response.
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.includes('auth-token') || cookie.name.includes('code-verifier')) {
      response.cookies.set(cookie.name, '', {
        path: '/',
        maxAge: 0,
      })
    }
  }

  return response
}
