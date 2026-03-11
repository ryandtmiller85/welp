import { cookies } from 'next/headers'

const ADMIN_COOKIE = 'welp-admin-session'

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE)
  if (!session?.value) return false
  return session.value === process.env.ADMIN_SECRET
}

export function getAdminCookieName() {
  return ADMIN_COOKIE
}
