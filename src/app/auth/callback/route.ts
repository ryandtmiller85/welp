import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const supabase = await createClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Auth exchange error:', exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
      }
    } catch (err) {
      console.error('Unexpected error during auth callback:', err)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=unexpected`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
