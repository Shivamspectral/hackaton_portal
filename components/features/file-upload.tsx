'use client'

import { UploadCloud } from 'lucide-react'
import { useId, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

// Single source of truth for the cap — bump this if the limit ever changes.
export const MAX_UPLOAD_BYTES = 30 * 1024 * 1024 // 30MB

function formatMB(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function FileUpload({
  onFileSelected,
  accept = '.ppt,.pptx',
  disabled = false,
  hint = 'PPT or PPTX · up to 30MB',
  maxBytes = MAX_UPLOAD_BYTES,
}: {
  onFileSelected: (file: File) => void
  accept?: string
  disabled?: boolean
  hint?: string
  maxBytes?: number
}) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extensions = accept.split(',').map((e) => e.trim().toLowerCase())

  function validateAndEmit(file: File | undefined) {
    if (!file) return
    const ok = extensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    if (!ok) {
      setError(`Unsupported file type. Accepted: ${extensions.join(', ')}`)
      return
    }
    if (file.size > maxBytes) {
      setError(
        `File is too large (${formatMB(file.size)}). Max size is ${formatMB(maxBytes)}.`,
      )
      return
    }
    setError(null)
    onFileSelected(file)
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (disabled) return
          validateAndEmit(e.dataTransfer.files?.[0])
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-10 text-center transition-colors',
          dragging && 'border-primary/60 bg-primary/5',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span className="grid size-12 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <UploadCloud className="size-6" />
        </span>
        <span className="text-sm font-medium text-foreground">
          Drag &amp; drop your deck here, or{' '}
          <span className="text-primary">browse files</span>
        </span>
        <span className="font-mono text-xs text-muted-foreground">{hint}</span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => validateAndEmit(e.target.files?.[0])}
        />
      </label>
      {error && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
