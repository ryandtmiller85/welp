'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { MessageSquarePlus, X, Camera, Send, ChevronDown, Check, Pencil } from 'lucide-react'

const CATEGORIES = [
  { value: 'bug', label: 'Bug', emoji: '🐛' },
  { value: 'confusion', label: 'Confusing', emoji: '😕' },
  { value: 'suggestion', label: 'Suggestion', emoji: '💡' },
  { value: 'praise', label: 'Love it', emoji: '❤️' },
  { value: 'general', label: 'General', emoji: '💬' },
] as const

const SEVERITIES = [
  { value: 'low', label: 'Low', color: 'bg-slate-200 text-slate-700' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
] as const

type Category = typeof CATEGORIES[number]['value']
type Severity = typeof SEVERITIES[number]['value']

interface AnnotationMark {
  x: number
  y: number
  width: number
  height: number
}

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<Category>('general')
  const [severity, setSeverity] = useState<Severity>('medium')
  const [description, setDescription] = useState('')
  const [screenshotData, setScreenshotData] = useState<string | null>(null)
  const [annotating, setAnnotating] = useState(false)
  const [annotations, setAnnotations] = useState<AnnotationMark[]>([])
  const [currentAnnotation, setCurrentAnnotation] = useState<AnnotationMark | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const annotationStartRef = useRef<{ x: number; y: number } | null>(null)

  // Take screenshot using html2canvas-style approach (capture visible area)
  const captureScreenshot = useCallback(async () => {
    try {
      // Use the native browser API to capture the page
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas to viewport size
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = width
      canvas.height = height

      // Try to use html2canvas if available, otherwise take a simple screenshot
      // For simplicity, we'll serialize the current DOM to an image via SVG foreignObject
      const data = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${new XMLSerializer().serializeToString(document.documentElement)}
            </div>
          </foreignObject>
        </svg>
      `

      const img = new Image()
      const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          URL.revokeObjectURL(url)
          resolve()
        }
        img.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('Failed to capture'))
        }
        img.src = url
      })

      setScreenshotData(canvas.toDataURL('image/png', 0.7))
      setAnnotating(true)
      setAnnotations([])
    } catch {
      // If SVG approach fails, just skip screenshot
      console.warn('Screenshot capture failed — annotation will work without background')
      // Create a blank canvas for annotation
      setScreenshotData(null)
      setAnnotating(true)
      setAnnotations([])
    }
  }, [])

  // Draw annotations on canvas
  useEffect(() => {
    if (!annotating || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw screenshot background if available
    if (screenshotData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        drawAnnotations(ctx)
      }
      img.src = screenshotData
    } else {
      // Gray background placeholder
      ctx.fillStyle = '#f1f5f9'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Draw rectangles to highlight areas', canvas.width / 2, canvas.height / 2)
      drawAnnotations(ctx)
    }

    function drawAnnotations(ctx: CanvasRenderingContext2D) {
      const allAnnotations = [...annotations, ...(currentAnnotation ? [currentAnnotation] : [])]
      allAnnotations.forEach((a, i) => {
        // Semi-transparent red overlay
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 3
        ctx.setLineDash([])
        ctx.strokeRect(a.x, a.y, a.width, a.height)

        // Fill with very light red
        ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'
        ctx.fillRect(a.x, a.y, a.width, a.height)

        // Number label
        ctx.fillStyle = '#ef4444'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`${i + 1}`, a.x + 4, a.y + 16)
      })
    }
  }, [annotating, annotations, currentAnnotation, screenshotData])

  const handleAnnotationMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    annotationStartRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handleAnnotationMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!annotationStartRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const endX = (e.clientX - rect.left) * scaleX
    const endY = (e.clientY - rect.top) * scaleY
    setCurrentAnnotation({
      x: Math.min(annotationStartRef.current.x, endX),
      y: Math.min(annotationStartRef.current.y, endY),
      width: Math.abs(endX - annotationStartRef.current.x),
      height: Math.abs(endY - annotationStartRef.current.y),
    })
  }

  const handleAnnotationMouseUp = () => {
    if (currentAnnotation && currentAnnotation.width > 10 && currentAnnotation.height > 10) {
      setAnnotations((prev) => [...prev, currentAnnotation])
    }
    setCurrentAnnotation(null)
    annotationStartRef.current = null
  }

  const finishAnnotating = () => {
    // Render final annotated image
    if (canvasRef.current) {
      setScreenshotData(canvasRef.current.toDataURL('image/png', 0.7))
    }
    setAnnotating(false)
  }

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please describe the feedback')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_url: window.location.href,
          page_title: document.title,
          category,
          severity,
          description: description.trim(),
          screenshot_data: screenshotData,
          user_agent: navigator.userAgent,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit')
      }

      setSubmitted(true)
      setTimeout(() => {
        resetForm()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setOpen(false)
    setCategory('general')
    setSeverity('medium')
    setDescription('')
    setScreenshotData(null)
    setAnnotating(false)
    setAnnotations([])
    setCurrentAnnotation(null)
    setSubmitted(false)
    setError(null)
  }

  // Annotation overlay
  if (annotating) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex flex-col">
        <div className="bg-white px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-rose-600" />
            <span className="text-sm font-medium text-slate-900">
              Draw rectangles to highlight problem areas
            </span>
            <span className="text-xs text-slate-500">
              ({annotations.length} annotation{annotations.length !== 1 ? 's' : ''})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {annotations.length > 0 && (
              <button
                onClick={() => setAnnotations([])}
                className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
              >
                Clear all
              </button>
            )}
            <button
              onClick={finishAnnotating}
              className="bg-rose-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-rose-700 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            width={Math.min(window.innerWidth, 1200)}
            height={Math.min(window.innerHeight, 800)}
            className="border border-white/20 rounded-lg cursor-crosshair max-w-full max-h-full"
            style={{ imageRendering: 'auto' }}
            onMouseDown={handleAnnotationMouseDown}
            onMouseMove={handleAnnotationMouseMove}
            onMouseUp={handleAnnotationMouseUp}
          />
        </div>
      </div>
    )
  }

  // Success state
  if (submitted) {
    return (
      <div className="fixed bottom-6 right-6 z-[9998]">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-80 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <p className="font-medium text-slate-900">Thanks for the feedback!</p>
          <p className="text-sm text-slate-500 mt-1">It&apos;s been recorded for review.</p>
        </div>
      </div>
    )
  }

  // Main widget
  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[9998] bg-rose-600 hover:bg-rose-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all group"
          title="Send feedback"
        >
          <MessageSquarePlus className="w-6 h-6" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Send feedback
          </span>
        </button>
      )}

      {/* Feedback panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[9998] bg-white rounded-2xl shadow-2xl border border-slate-200 w-96 max-h-[80vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Send Feedback</h3>
              <p className="text-xs text-slate-500 mt-0.5">Help us improve Welp</p>
            </div>
            <button
              onClick={resetForm}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Category pills */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Type
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                      category === cat.value
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            {(category === 'bug' || category === 'confusion') && (
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Severity
                </label>
                <div className="flex gap-2 mt-2">
                  {SEVERITIES.map((sev) => (
                    <button
                      key={sev.value}
                      onClick={() => setSeverity(sev.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        severity === sev.value
                          ? `${sev.color} border-current`
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {sev.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  category === 'bug'
                    ? 'What happened? What did you expect?'
                    : category === 'confusion'
                      ? 'What was confusing? Where did you get stuck?'
                      : category === 'suggestion'
                        ? 'What would make this better?'
                        : category === 'praise'
                          ? 'What did you like?'
                          : 'Tell us what you think...'
                }
                className="mt-2 w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 resize-none"
                rows={4}
              />
            </div>

            {/* Screenshot */}
            <div>
              {screenshotData ? (
                <div className="relative">
                  <img
                    src={screenshotData}
                    alt="Annotated screenshot"
                    className="w-full rounded-lg border border-slate-200"
                  />
                  <button
                    onClick={() => {
                      setScreenshotData(null)
                      setAnnotations([])
                    }}
                    className="absolute top-2 right-2 bg-white/90 p-1 rounded-full shadow"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={captureScreenshot}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Capture &amp; annotate screen
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100">
            <button
              onClick={handleSubmit}
              disabled={submitting || !description.trim()}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
