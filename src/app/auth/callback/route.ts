import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard'
  const origin = requestUrl.origin

  if (code) {
    // We need a temporary response to capture the cookies from exchangeCodeForSession
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
      // Build cookie-setting JavaScript from the collected cookies
      // This uses document.cookie which we've verified works on this domain
      const cookieScript = cookiesCollected
        .map(({ name, value, options }) => {
          const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`]
          parts.push('path=/')
          if (options?.maxAge) parts.push(`max-age=${options.maxAge}`)
          if (options?.sameSite) parts.push(`samesite=${options.sameSite}`)
          if (options?.secure) parts.push('secure')
          // Note: we intentionally omit httpOnly so document.cookie can set them
          return `document.cookie = "${parts.join('; ')}";`
        })
        .join('\n      ')

      const redirectUrl = new URL(redirectTo, origin).toString()

      const html = `<!DOCTYPE html>
<html>
  <head><title>Authenticating...</title></head>
  <body>
    <p>Signing you in...</p>
    <script>
      ${cookieScript}
      window.location.replace("${redirectUrl}");
    </script>
  </body>
</html>`

      return new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      })
    }

    console.error('Auth exchange error:', error)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error?.message || 'Unknown error')}`, origin)
    )
  }

  return NextResponse.redirect(new URL('/auth/login', origin))
}
