import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized, unauthorized, getAdminSupabase } from '@/lib/admin-api'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorized()

  const checks: Record<string, { status: string; detail?: string }> = {}

  // Supabase health
  try {
    const supabase = getAdminSupabase()
    const start = Date.now()
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
    const latency = Date.now() - start
    checks.supabase = error
      ? { status: 'error', detail: error.message }
      : { status: 'healthy', detail: `${latency}ms` }
  } catch (err: any) {
    checks.supabase = { status: 'error', detail: err.message }
  }

  // Stripe config
  checks.stripe = process.env.STRIPE_SECRET_KEY
    ? { status: 'healthy', detail: 'Key configured' }
    : { status: 'error', detail: 'STRIPE_SECRET_KEY missing' }

  checks.stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET
    ? { status: 'healthy', detail: 'Secret configured' }
    : { status: 'error', detail: 'STRIPE_WEBHOOK_SECRET missing' }

  // Printify config
  checks.printify = process.env.PRINTIFY_API_TOKEN
    ? { status: 'healthy', detail: 'Token configured' }
    : { status: 'warning', detail: 'PRINTIFY_API_TOKEN missing' }

  // Env vars summary
  const envVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'ADMIN_SECRET',
    'PRINTIFY_API_TOKEN',
    'PRINTIFY_SHOP_ID',
    'NEXT_PUBLIC_APP_URL',
  ]

  const envStatus: Record<string, boolean> = {}
  for (const v of envVars) {
    envStatus[v] = !!process.env[v]
  }

  return NextResponse.json({
    checks,
    envStatus,
    runtime: {
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
    },
  })
}
