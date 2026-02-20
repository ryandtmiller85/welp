import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))

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

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Check for redirect_to param (from Supabase OAuth)
        const redirectTo = requestUrl.searchParams.get('redirect_to')
        if (redirectTo) {
          try {
            const redirectUrl = new URL(redirectTo)
            // Create new response with same cookies for the redirect URL
            const customResponse = NextResponse.redirect(redirectUrl)
            response.cookies.getAll().forEach(c => {
              customResponse.cookies.set(c.name, c.value)
            })
            return customResponse
          } catch {
            // If redirect_to is a relative path
            const customResponse = NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
            response.cookies.getAll().forEach(c => {
              customResponse.cookies.set(c.name, c.value)
            })
            return customResponse
          }
        }
        return response
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // Redirect to login on error
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}
