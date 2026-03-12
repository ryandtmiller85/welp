import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase, isAdminAuthorized, unauthorized } from '@/lib/admin-api'

const TEST_ACCOUNTS = [
  // Agent tester accounts
  { email: 'agent-1@alliswelp.com', password: 'WelpTest2026!', role: 'agent' },
  { email: 'agent-2@alliswelp.com', password: 'WelpTest2026!', role: 'agent' },
  { email: 'agent-3@alliswelp.com', password: 'WelpTest2026!', role: 'agent' },
  // Human tester accounts
  { email: 'tester-1@alliswelp.com', password: 'WelpTest2026!', role: 'human' },
  { email: 'tester-2@alliswelp.com', password: 'WelpTest2026!', role: 'human' },
  { email: 'tester-3@alliswelp.com', password: 'WelpTest2026!', role: 'human' },
  { email: 'tester-4@alliswelp.com', password: 'WelpTest2026!', role: 'human' },
  { email: 'tester-5@alliswelp.com', password: 'WelpTest2026!', role: 'human' },
  { email: 'tester-6@alliswelp.com', password: 'WelpTest2026!', role: 'human' },
  { email: 'tester-7@alliswelp.com', password: 'WelpTest2026!', role: 'human' },
]

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return unauthorized()
  }

  // Only allow in testing mode
  if (process.env.NEXT_PUBLIC_TESTING_MODE !== 'true') {
    return NextResponse.json(
      { error: 'Test account creation is only available in testing mode' },
      { status: 403 }
    )
  }

  const supabase = getAdminSupabase()
  const results: { email: string; status: string; error?: string }[] = []

  for (const account of TEST_ACCOUNTS) {
    try {
      // First try to delete existing user with this email (in case of stale SQL insert)
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existing = existingUsers?.users?.find(u => u.email === account.email)
      if (existing) {
        await supabase.auth.admin.deleteUser(existing.id)
      }

      // Create user via Admin API (properly creates identity records + password hash)
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true, // Skip email verification
        user_metadata: {
          role: account.role,
          is_test_account: true,
        },
      })

      if (error) {
        results.push({ email: account.email, status: 'error', error: error.message })
      } else {
        results.push({ email: account.email, status: 'created' })
      }
    } catch (err) {
      results.push({
        email: account.email,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const created = results.filter(r => r.status === 'created').length
  const errors = results.filter(r => r.status === 'error').length

  return NextResponse.json({
    message: `Created ${created} accounts, ${errors} errors`,
    results,
  })
}
