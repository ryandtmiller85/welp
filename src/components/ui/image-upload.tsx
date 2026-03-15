'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  /** Current image URL (for showing preview) */
  value?: string | null
  /** Called when upload succeeds with the public URL */
  onChange: (url: string | null) => void
  /** Folder path in storage (e.g. 'profiles', 'items') */
  folder?: string
  /** Label text */
  label?: string
  /** Help text shown below */
  hint?: string
  /** Shape of the preview */
  shape?: 'square' | 'rounded' | 'circle'
  /** Preview size class */
  previewSize?: string
  /** Whether to allow removal */
  allowRemove?: boolean
  /** Accept mime types */
  accept?: string
}

export function ImageUpload({
  value,
  onChange,
  folder = 'general',
  label = 'Upload Image',
  hint,
  shape = 'rounded',
  previewSize = 'w-32 h-32',
  allowRemove = true,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const shapeClasses = {
    square: 'rounded-lg',
    rounded: 'rounded-2xl',
    circle: 'rounded-full',
  }

  const handleFile = useCallback(
    async (file: File) => {
      setError('')
      setUploading(true)

      try {
        // Client-side validation
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File too large. Maximum 5MB.')
        }

        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch(`/api/upload?folder=${folder}`, {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload failed')
        }

        const { url } = await res.json()
        onChange(url)
      } catch (err: any) {
        setError(err.message || 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [folder, onChange]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      )}

      {value ? (
        /* Preview mode */
        <div className="relative inline-block">
          <img
            src={value}
            alt="Upload preview"
            className={`${previewSize} ${shapeClasses[shape]} object-cover border border-slate-200`}
          />
          {allowRemove && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
              aria-label="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        /* Upload zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed ${
            dragOver ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-slate-50'
          } ${shapeClasses[shape]} p-8 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-all`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
              <p className="text-sm text-slate-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <p className="text-sm text-slate-600 font-medium">
                Click or drag to upload
              </p>
              <p className="text-xs text-slate-400">JPG, PNG, WebP, GIF · Max 5MB</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}

      {hint && !error && (
        <p className="text-xs text-slate-500 mt-1">{hint}</p>
      )}
    </div>
  )
}
