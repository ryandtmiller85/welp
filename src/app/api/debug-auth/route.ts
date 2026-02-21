import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // List cookie names and sizes (not values for security)
  const cookieInfo = allCookies.map(c => ({
    name: c.name,
    valueLength: c.value.length,
    valuePreview: c.value.substring(0, 20) + '...',
  }))

  // Try to get user
  let userInfo = null
  let authError = null
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server component context
            }
          },
        },
      }
    )
    const { data, error } = await supabase.auth.getUser()
    userInfo = data?.user ? { id: data.user.id, email: data.user.email } : null
    authError = error?.message || null
  } catch (e: any) {
    authError = e.message
  }

  return NextResponse.json({
    cookieCount: allCookies.length,
    cookies: cookieInfo,
    user: userInfo,
    error: authError,
  })
}
