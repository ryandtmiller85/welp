import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard'
  const origin = requestUrl.origin

  if (code) {
    // Collect cookies for diagnostic purposes
    const cookiesCollected: Array<{ name: string; value: string; options: any }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach((cookie) => cookiesCollected.push(cookie))
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // DIAGNOSTIC: redirect to debug page that shows what cookies were collected
      // Set the cookies on the redirect response (the approach that works for test cookies)
      const redirectUrl = new URL('/api/debug-auth', origin).toString()
      const response = NextResponse.redirect(redirectUrl)

      // Set each collected cookie on the response
      for (const { name, value, options } of cookiesCollected) {
        response.cookies.set(name, value, options)
      }

      // Also set a diagnostic cookie with info about what we collected
      response.cookies.set('auth_debug_info', JSON.stringify({
        count: cookiesCollected.length,
        names: cookiesCollected.map(c => c.name),
        sizes: cookiesCollected.map(c => `${c.name}:${c.value.length}`),
        options: cookiesCollected.map(c => JSON.stringify(c.options)),
      }), {
        path: '/',
        maxAge: 300,
        sameSite: 'lax' as const,
        secure: true,
      })

      return response
    }

    console.error('Auth exchange error:', error)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error?.message || 'Unknown error')}`, origin)
    )
  }

  return NextResponse.redirect(new URL('/auth/login', origin))
}
