import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Check if auth cookies exist BEFORE creating the Supabase client.
  // This is used for the redirect decision so that even if getUser()
  // fails (and deletes cookies), we don't redirect a user who had
  // valid cookies when the request started.
  const hadAuthCookies = request.cookies
    .getAll()
    .some((c) => c.name.includes('auth-token'))

  let supabaseResponse = NextResponse.next({ request })

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

          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Call getUser() to attempt token refresh. If it fails, that's okay —
  // we won't redirect based on this result. The layout will use
  // getSession() which reads cookies without network calls.
  try {
    await supabase.auth.getUser()
  } catch {
    // Token refresh failed — not a reason to redirect.
    // The layout's getSession() will still work with existing cookies.
  }

  // Protect dashboard routes: only redirect if there were NO auth
  // cookies at all (user never logged in or explicitly logged out).
  // Don't redirect if cookies existed but getUser() failed — that
  // would lock out users with valid refresh tokens.
  if (!hadAuthCookies && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
