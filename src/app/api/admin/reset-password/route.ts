import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase, isAdminAuthorized, unauthorized } from '@/lib/admin-api'

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorized()
  }

  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'email and password are required' },
      { status: 400 }
    )
  }

  const supabase = getAdminSupabase()

  // Find the user by email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 })
  }

  const user = users?.users?.find(u => u.email === email)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Update the password
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password,
  })

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    message: `Password updated for ${email}`,
  })
}
