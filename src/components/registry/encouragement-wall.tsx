'use client'

import type { Encouragement } from '@/lib/types/database'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { useState } from 'react'

interface EncouragementWallProps {
  profileId: string
  encouragements: Encouragement[]
}

export function EncouragementWall({ profileId, encouragements: initialEncouragements }: EncouragementWallProps) {
  const [encouragements, setEncouragements] = useState(initialEncouragements)
  const [showForm, setShowForm] = useState(false)

  const handleEncouragementAdded = (newEncouragement: Encouragement) => {
    setEncouragements([newEncouragement, ...encouragements])
    setShowForm(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Messages of Support</h2>
            <p className="text-slate-600 mt-2">
              {encouragements.length === 0
                ? 'Be the first to send a message of support'
                : `${encouragements.length} ${encouragements.length === 1 ? 'person has' : 'people have'} sent messages of support`}
            </p>
          </div>
        </div>
      </CardHeader>

      {/* Encouragements Display */}
      {encouragements.length > 0 && (
        <CardContent className="border-t border-slate-100">
          <div className="space-y-6">
            {encouragements.map((msg) => (
              <div
                key={msg.id}
                className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-6 border border-rose-100/50"
              >
                <p className="text-slate-800 font-light text-lg leading-relaxed mb-4">
                  "{msg.message}"
                </p>
                <p className="text-sm font-medium text-rose-700">— {msg.author_name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {/* Form Section */}
      <CardFooter className={encouragements.length > 0 ? 'border-t border-slate-100' : ''}>
        <div className="w-full">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200"
            >
              Send a Message of Support
            </button>
          )}

          {showForm && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">
                Leave a Message
              </h3>
              <EncouragementFormWrapper
                profileId={profileId}
                onSuccess={handleEncouragementAdded}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

// Wrapper to handle form submission
function EncouragementFormWrapper({
  profileId,
  onSuccess,
  onCancel,
}: {
  profileId: string
  onSuccess: (msg: Encouragement) => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
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
        const newEncouragement = await response.json()
        setMessage('')
        setName('')
        onSuccess(newEncouragement)
      } else {
        setError('Failed to send message. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Error posting encouragement:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-colors text-base"
      />

      <textarea
        placeholder="Send a message of support..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-colors resize-none min-h-[100px] text-base font-light"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !name.trim() || !message.trim()}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
