import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Simple cookie-forwarding middleware.
  //
  // We intentionally do NOT create a Supabase client here. When
  // getUser() or getSession() fails (network error, token issue),
  // the Supabase SDK calls setAll() with maxAge:0 cookies, which
  // deletes auth cookies from the browser. This causes users to be
  // silently logged out on the next request.
  //
  // Instead: forward auth cookies on every response to keep them alive,
  // and check cookie presence for route protection. Token refresh
  // happens client-side via the browser Supabase client.

  const response = NextResponse.next({ request })

  // Re-set auth cookies on the response to keep them alive.
  // Without explicit Set-Cookie headers, cookies can expire or be
  // lost across navigations.
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.includes('auth-token') || cookie.name.includes('code-verifier')) {
      response.cookies.set(cookie.name, cookie.value, {
        path: '/',
        sameSite: 'lax',
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60, // 30 days
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
