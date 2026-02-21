import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST — claim a proxy registry (transfer ownership to the authenticated user)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch the proxy profile
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('is_proxy', true)
    .single() as any

  if (fetchError || !profile) {
    return NextResponse.json({ error: 'Registry not found' }, { status: 404 })
  }

  if (profile.claimed_by_user_id) {
    return NextResponse.json({ error: 'This registry has already been claimed' }, { status: 400 })
  }

  // Can't claim your own proxy registry
  if (profile.created_by_user_id === session.user.id) {
    return NextResponse.json({ error: 'You cannot claim a registry you created' }, { status: 400 })
  }

  // Update the profile to mark it as claimed
  // Use RPC since the user might not have direct UPDATE access to this row
  const { error: updateError } = await supabase.rpc('claim_proxy_profile', {
    p_profile_id: id,
    p_claimed_by: session.user.id,
  }) as any

  if (updateError) {
    console.error('Claim error:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Registry claimed successfully',
    slug: profile.slug,
  })
}
