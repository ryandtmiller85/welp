'use client'

import { Badge } from '@/components/admin/admin-table'
import { ExternalLink } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Settings</h1>

      {/* Quick links */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">External Dashboards</h3>
        </div>
        <div className="divide-y divide-slate-800/50">
          {[
            { label: 'Vercel Dashboard', url: 'https://vercel.com/ryans-projects-1cff6bce/welp' },
            { label: 'Supabase Dashboard', url: 'https://supabase.com/dashboard' },
            { label: 'Stripe Dashboard', url: 'https://dashboard.stripe.com' },
            { label: 'Printify Dashboard', url: 'https://printify.com/app/store/products' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener"
              className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-sm text-white">{link.label}</span>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          ))}
        </div>
      </div>

      {/* Feature flags placeholder */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Feature Flags</h3>
          <Badge color="amber">Coming Soon</Badge>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-400">
            Feature flags will allow you to toggle features like proxy registries, merch store,
            curated shop, and maintenance mode without redeploying.
          </p>
        </div>
      </div>

      {/* Admin info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Admin Portal Info</h3>
        <div className="space-y-2 text-sm text-slate-400">
          <p>Authentication: Session cookie (ADMIN_SECRET)</p>
          <p>Session duration: 7 days</p>
          <p>To change the admin secret, update ADMIN_SECRET in Vercel environment variables and redeploy.</p>
        </div>
      </div>
    </div>
  )
}
