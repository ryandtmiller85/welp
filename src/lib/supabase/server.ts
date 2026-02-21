import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // IMPORTANT: Do NOT call cookieStore.set() here at all.
          //
          // In Server Components, cookieStore.set() throws ReadonlyRequestCookiesError.
          // But even with a try/catch, Next.js may still process the attempted
          // Set-Cookie headers BEFORE throwing, causing auth cookies to be
          // deleted from the browser response.
          //
          // The middleware handles all cookie refreshing. Server Components
          // only need to READ cookies (via getAll), never write them.
          // Intentionally a no-op.
        },
      },
    }
  )
}
