import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const response = NextResponse.redirect(`${requestUrl.origin}/`)

  // Create a Supabase client that can read/write cookies on this response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Sign out on the server — revokes the refresh token so old sessions
  // can't be reused. scope: 'local' only affects this browser's session.
  await supabase.auth.signOut({ scope: 'local' })

  // Belt-and-suspenders: also clear auth cookies directly in case
  // signOut's setAll didn't fire (e.g. network error)
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
