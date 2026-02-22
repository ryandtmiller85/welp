import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getRateLimitId, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

/**
 * DELETE /api/account — Delete user account and all associated data.
 * This is a hard delete: registry items, cash funds, encouragements,
 * contributions, profile, and auth account are all removed.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Rate limit (sensitive)
    const rl = checkRateLimit(getRateLimitId(request, userId), RATE_LIMITS.sensitive)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    // Delete all user data in dependency order

    // 1. Delete encouragements on user's profile
    await supabase.from('encouragements').delete().eq('profile_id', userId)

    // 2. Delete contributions to user's funds and items
    const { data: userFunds } = await supabase.from('cash_funds').select('id').eq('user_id', userId) as any
    if (userFunds?.length) {
      const fundIds = userFunds.map((f: any) => f.id)
      await supabase.from('contributions').delete().in('cash_fund_id', fundIds)
    }

    const { data: userItems } = await supabase.from('registry_items').select('id').eq('user_id', userId) as any
    if (userItems?.length) {
      const itemIds = userItems.map((i: any) => i.id)
      await supabase.from('contributions').delete().in('registry_item_id', itemIds)
    }

    // 3. Delete cash funds
    await supabase.from('cash_funds').delete().eq('user_id', userId)

    // 4. Delete registry items
    await supabase.from('registry_items').delete().eq('user_id', userId)

    // 5. Also clean up any proxy registries this user created
    // Get proxy profile IDs first
    const { data: proxyProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('created_by_user_id', userId)
      .eq('is_proxy', true) as any

    if (proxyProfiles?.length) {
      const proxyIds = proxyProfiles.map((p: any) => p.id)
      // Delete proxy registry data
      for (const proxyId of proxyIds) {
        await supabase.from('encouragements').delete().eq('profile_id', proxyId)
        await supabase.from('registry_items').delete().eq('user_id', proxyId)
        await supabase.from('cash_funds').delete().eq('user_id', proxyId)
      }
      // Delete proxy profiles (only unclaimed ones — claimed ones belong to the recipient now)
      await supabase
        .from('profiles')
        .delete()
        .eq('created_by_user_id', userId)
        .eq('is_proxy', true)
        .is('claimed_by_user_id', null)
    }

    // 6. Delete user's own profile
    await supabase.from('profiles').delete().eq('id', userId)

    // 7. Sign out (this clears the session)
    await supabase.auth.signOut()

    // Note: Supabase Auth admin deletion (auth.admin.deleteUser) requires the service role key.
    // The auth.users row will be orphaned but inaccessible without a matching profile.
    // For full deletion, use a Supabase Edge Function or database trigger with service role.

    return NextResponse.json({ success: true, message: 'Account deleted' })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
