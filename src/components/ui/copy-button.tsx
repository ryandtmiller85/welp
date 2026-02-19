'use client'

import { useState } from 'react'
import { Button } from './button'
import { Check, Copy } from 'lucide-react'

interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Button
      onClick={handleCopy}
      variant={copied ? 'secondary' : 'primary'}
      size="sm"
      className={className}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-1" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-1" />
          Copy
        </>
      )}
    </Button>
  )
}
