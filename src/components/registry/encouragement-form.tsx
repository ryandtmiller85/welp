'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface EncouragementFormProps {
  profileId: string
}

export function EncouragementForm({ profileId }: EncouragementFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/encouragements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          author_name: name,
          message,
          is_public: true,
        }),
      })

      if (response.ok) {
        setMessage('')
        setName('')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error posting encouragement:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="text-sm text-emerald-800">Thank you for your support! ❤️</p>
        </div>
      )}

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-colors"
      />

      <textarea
        placeholder="Send a message of support..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-colors resize-y min-h-[80px]"
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={loading || !name || !message}
        loading={loading}
      >
        Send Support
      </Button>
    </form>
  )
}
