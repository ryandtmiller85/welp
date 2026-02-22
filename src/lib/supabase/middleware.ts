import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Simple, bulletproof middleware:
  // 1. Always forward auth cookies from request → response (via Set-Cookie)
  // 2. Protect /dashboard routes by checking cookie presence
  //
  // NO Supabase client is created here. This avoids the problem where
  // getUser()/getSession() triggers _removeSession() → setAll() with
  // cookie deletions, which nukes the browser's auth cookies.
  //
  // Token validation happens in Server Components via getSession()
  // (read-only, no cookie writes). Token refresh happens client-side
  // via the browser Supabase client.

  const response = NextResponse.next({ request })

  // Always re-set auth cookies on the response to ensure the browser
  // keeps them. Without explicit Set-Cookie headers, the browser may
  // lose cookies across navigations.
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.includes('auth-token') || cookie.name.includes('code-verifier')) {
      response.cookies.set(cookie.name, cookie.value, {
        path: '/',
        sameSite: 'lax',
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60, // 30 days (was 400 — reduced to limit token compromise window)
      })
    }
  }

  // Protect dashboard routes: redirect to login if no auth cookies
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const hasAuthCookies = request.cookies
      .getAll()
      .some((c) => c.name.includes('auth-token'))

    if (!hasAuthCookies) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  return response
}
