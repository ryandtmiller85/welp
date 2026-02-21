import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const cookieInfo = allCookies.map(c => ({
    name: c.name,
    valueLength: c.value.length,
    preview: c.value.substring(0, 30) + (c.value.length > 30 ? '...' : ''),
  }))
  const authCookies = allCookies.filter(c => c.name.includes('auth-token'))
  return NextResponse.json({
    total: allCookies.length,
    authCookieCount: authCookies.length,
    authCookieNames: authCookies.map(c => c.name),
    allCookies: cookieInfo,
    timestamp: new Date().toISOString(),
  })
}
