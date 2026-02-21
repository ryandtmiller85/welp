import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // IMPORTANT: The middleware is the ONLY place where auth cookies can be
  // refreshed and written back to the browser. Server Components cannot
  // write cookies. This middleware must:
  // 1. Read auth cookies from the request
  // 2. Validate/refresh the token (via getUser())
  // 3. Write refreshed cookies back on the response
  // 4. Forward the refreshed cookies to downstream Server Components

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getUser() to validate the token with the Supabase Auth server.
  // This triggers a proper token refresh if needed, calling setAll()
  // to update cookies on the response. Never use getSession() here —
  // it doesn't revalidate and can leave stale tokens.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // CRITICAL: Ensure auth cookies from the request are always forwarded
  // on the response. If setAll() was never called (e.g. no token refresh
  // needed), the response has NO Set-Cookie headers for auth cookies.
  // Next.js/Vercel may not automatically forward them, causing the
  // browser to lose them on the next request.
  //
  // We explicitly re-set all auth-related cookies on the response to
  // ensure they're always present.
  const allCookies = request.cookies.getAll()
  for (const cookie of allCookies) {
    if (cookie.name.includes('auth-token') || cookie.name.includes('code-verifier')) {
      // Only set if not already on the response (i.e., setAll wasn't called)
      if (!supabaseResponse.cookies.get(cookie.name)) {
        supabaseResponse.cookies.set(cookie.name, cookie.value, {
          path: '/',
          sameSite: 'lax',
          httpOnly: false,
          maxAge: 400 * 24 * 60 * 60, // 400 days
        })
      }
    }
  }

  // Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
