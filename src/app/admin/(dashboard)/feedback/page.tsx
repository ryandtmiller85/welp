'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/admin/admin-table'
import { MessageSquare, Image, RefreshCw } from 'lucide-react'

interface Feedback {
  id: string
  created_at: string
  tester_email: string | null
  tester_name: string | null
  page_url: string
  page_title: string | null
  category: string
  description: string
  severity: string
  screenshot_data: string | null
  user_agent: string | null
  viewport_width: number | null
  viewport_height: number | null
  status: string
  admin_notes: string | null
}

const CATEGORY_COLORS: Record<string, string> = {
  bug: 'red',
  confusion: 'amber',
  suggestion: 'blue',
  praise: 'green',
  general: 'slate',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'amber',
  reviewed: 'blue',
  in_progress: 'purple',
  resolved: 'green',
  wont_fix: 'slate',
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  const fetchFeedback = async () => {
    setLoading(true)
    try {
      const adminSecret = document.cookie
        .split(';')
        .find((c) => c.trim().startsWith('welp-admin-session='))
        ?.split('=')[1]

      const params = new URLSearchParams()
      if (filterCategory) params.set('category', filterCategory)
      if (filterStatus) params.set('status', filterStatus)

      const res = await fetch(`/api/feedback?${params}`, {
        headers: { Authorization: `Bearer ${adminSecret}` },
      })
      const data = await res.json()
      setFeedback(data.feedback || [])
    } catch (err) {
      console.error('Failed to fetch feedback:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedback()
  }, [filterCategory, filterStatus])

  const selected = feedback.find((f) => f.id === selectedId)

  const updateStatus = async (id: string, newStatus: string) => {
    const adminSecret = document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('welp-admin-session='))
      ?.split('=')[1]

    // Use admin API to update
    await fetch(`/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminSecret}`,
      },
      body: JSON.stringify({ _action: 'update_status', id, status: newStatus }),
    })

    setFeedback((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Test Feedback
          </h1>
          <p className="text-slate-400 mt-1">{feedback.length} submissions</p>
        </div>
        <button
          onClick={fetchFeedback}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-white border border-slate-600 px-3 py-1.5 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-800 text-white text-sm rounded-lg border border-slate-700 px-3 py-1.5"
        >
          <option value="">All categories</option>
          <option value="bug">Bug</option>
          <option value="confusion">Confusing</option>
          <option value="suggestion">Suggestion</option>
          <option value="praise">Praise</option>
          <option value="general">General</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 text-white text-sm rounded-lg border border-slate-700 px-3 py-1.5"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="wont_fix">Won&apos;t Fix</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-slate-400 text-center py-12">Loading...</div>
          ) : feedback.length === 0 ? (
            <div className="text-slate-400 text-center py-12">No feedback yet</div>
          ) : (
            feedback.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedId === item.id
                    ? 'bg-slate-700 border-rose-500'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge color={CATEGORY_COLORS[item.category] || 'slate'}>
                    {item.category}
                  </Badge>
                  <Badge color={STATUS_COLORS[item.status] || 'slate'}>
                    {item.status}
                  </Badge>
                  {item.screenshot_data && (
                    <Image className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <p className="text-sm text-white line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  <span>{item.page_url.replace('https://','').replace('http://','')}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge color={CATEGORY_COLORS[selected.category] || 'slate'}>
                {selected.category}
              </Badge>
              {selected.severity && (
                <Badge color={selected.severity === 'critical' ? 'red' : selected.severity === 'high' ? 'orange' : 'slate'}>
                  {selected.severity}
                </Badge>
              )}
            </div>

            <p className="text-white whitespace-pre-wrap mb-4">{selected.description}</p>

            {selected.screenshot_data && (
              <div className="mb-4">
                <img
                  src={selected.screenshot_data}
                  alt="Screenshot"
                  className="w-full rounded-lg border border-slate-600"
                />
              </div>
            )}

            <div className="space-y-2 text-sm text-slate-400 mb-4">
              <div><strong className="text-slate-300">Page:</strong> {selected.page_url}</div>
              <div><strong className="text-slate-300">Date:</strong> {new Date(selected.created_at).toLocaleString()}</div>
              {selected.tester_email && (
                <div><strong className="text-slate-300">Tester:</strong> {selected.tester_email}</div>
              )}
              {selected.viewport_width && (
                <div><strong className="text-slate-300">Viewport:</strong> {selected.viewport_width}x{selected.viewport_height}</div>
              )}
            </div>

            {/* Status update */}
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider">Update status</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['new', 'reviewed', 'in_progress', 'resolved', 'wont_fix'].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selected.status === s
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
