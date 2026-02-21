import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action')

  if (action === 'set-redirect') {
    // Mimic what the auth callback does: set cookies on a redirect response
    const response = NextResponse.redirect(new URL('/api/test-cookie?action=check', request.url))
    response.cookies.set('test_server_cookie', 'hello_from_server', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      maxAge: 3600,
    })
    response.cookies.set('test_visible_cookie', 'visible_from_server', {
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'lax' as const,
      maxAge: 3600,
    })
    return response
  }

  if (action === 'set-json') {
    // Set cookies on a non-redirect response
    const response = NextResponse.json({ message: 'cookies set' })
    response.cookies.set('test_json_cookie', 'from_json_response', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      maxAge: 3600,
    })
    return response
  }

  // Default: show all cookies
  const allCookies = request.cookies.getAll()
  return NextResponse.json({
    cookieCount: allCookies.length,
    cookies: allCookies.map(c => ({
      name: c.name,
      valueLength: c.value.length,
      valuePreview: c.value.substring(0, 30),
    })),
  })
}
