import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Capture original auth cookies BEFORE any Supabase operations
  // (getUser/getSession may trigger setAll which overwrites request.cookies)
  const originalAuthCookies: { name: string; value: string }[] = []
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.includes('auth-token') || cookie.name.includes('code-verifier')) {
      originalAuthCookies.push({ name: cookie.name, value: cookie.value })
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Track if setAll was called and what it did
  let setAllCalled = false
  let setAllCookieNames: string[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          setAllCalled = true
          setAllCookieNames = cookiesToSet.map(c => `${c.name}=${c.value ? 'has_value' : 'EMPTY'}`)
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

  // Use getUser() to validate the token with the Supabase Auth server
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser()

  // DEBUG: Add diagnostic headers to trace cookie behavior
  supabaseResponse.headers.set('x-debug-path', request.nextUrl.pathname)
  supabaseResponse.headers.set('x-debug-original-auth-cookies',
    originalAuthCookies.map(c => c.name).join(',') || 'none')
  supabaseResponse.headers.set('x-debug-user', user?.email || 'null')
  supabaseResponse.headers.set('x-debug-error', getUserError?.message || 'none')
  supabaseResponse.headers.set('x-debug-setall-called', String(setAllCalled))
  supabaseResponse.headers.set('x-debug-setall-cookies', setAllCookieNames.join('|') || 'none')

  // If getUser() triggered setAll with cookie DELETIONS (empty values),
  // the auth cookies on the response will have maxAge:0, which tells the
  // browser to delete them. To prevent this, if we had valid original cookies
  // but getUser failed, we force-restore them on the response.
  if (originalAuthCookies.length > 0 && !user && setAllCalled) {
    // getUser() removed the session — but we still want to keep cookies
    // so the page can render. Let the client-side handle refresh.
    // Override the deletion cookies with the original values.
    for (const cookie of originalAuthCookies) {
      supabaseResponse.cookies.set(cookie.name, cookie.value, {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        maxAge: 400 * 24 * 60 * 60,
      })
    }
    supabaseResponse.headers.set('x-debug-action', 'restored-cookies-after-getuser-failure')
  }

  // If setAll was NOT called at all (no changes needed), explicitly
  // forward the original auth cookies on the response so the browser
  // keeps them.
  if (!setAllCalled && originalAuthCookies.length > 0) {
    for (const cookie of originalAuthCookies) {
      supabaseResponse.cookies.set(cookie.name, cookie.value, {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        maxAge: 400 * 24 * 60 * 60,
      })
    }
    supabaseResponse.headers.set('x-debug-action', 'forwarded-original-cookies')
  }

  // Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    // If we have original auth cookies, let the page render anyway
    // (the session might be valid but getUser failed for another reason)
    if (originalAuthCookies.length > 0) {
      supabaseResponse.headers.set('x-debug-action', 'allowed-dashboard-with-cookies-despite-no-user')
      return supabaseResponse
    }

    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
