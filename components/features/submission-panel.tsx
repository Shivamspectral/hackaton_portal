'use client'

import { CheckCircle2, ExternalLink, FileText, Loader2, RefreshCw } from 'lucide-react'
import { useState } from 'react'

import { FileUpload } from '@/components/features/file-upload'
import { Button } from '@/components/ui/button'
import { getSubmissionDownloadUrl, uploadSubmission } from '@/lib/submissions-client'
import type { Submission } from '@/lib/types'

type State =
  | { kind: 'empty' }
  | { kind: 'uploading'; fileName: string }
  | { kind: 'submitted'; fileName: string; fileUrl: string; timestamp: string }

function initialState(submission: Submission): State {
  if (submission.status === 'submitted' && submission.fileName) {
    return {
      kind: 'submitted',
      fileName: submission.fileName,
      fileUrl: submission.fileUrl,
      timestamp: submission.timestamp ?? new Date().toISOString(),
    }
  }
  return { kind: 'empty' }
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function SubmissionPanel({
  submission,
  teamDbId,
}: {
  submission: Submission
  teamDbId?: string
}) {
  const [state, setState] = useState<State>(() => initialState(submission))
  const [error, setError] = useState<string | null>(null)
  const [opening, setOpening] = useState(false)

  async function handleFile(file: File) {
    setError(null)
    setState({ kind: 'uploading', fileName: file.name })
    const res = await uploadSubmission(teamDbId, file)
    if (res.ok) {
      setState({
        kind: 'submitted',
        fileName: res.fileName,
        fileUrl: res.fileUrl,
        timestamp: res.timestamp,
      })
    } else {
      setError(res.error ?? 'Upload failed. Please try again.')
      setState({ kind: 'empty' })
    }
  }

  async function handleView(fileUrl: string) {
    if (!fileUrl) return
    setError(null)
    setOpening(true)
    const url = await getSubmissionDownloadUrl(fileUrl)
    setOpening(false)
    if (!url) {
      setError('Could not open your deck. Please try again.')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (state.kind === 'uploading') {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <Loader2 className="size-6 animate-spin" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold">
            {state.fileName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Uploading your deck…</p>
        </div>
      </div>
    )
  }

  if (state.kind === 'submitted') {
    return (
      <div className="rounded-2xl border border-chart-3/40 bg-chart-3/[0.06] p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-chart-3/40 bg-chart-3/10 text-chart-3">
            <FileText className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-chart-3" />
              <span className="text-sm font-semibold text-chart-3">Submitted</span>
            </div>
            <p className="mt-1.5 truncate font-display text-sm font-semibold text-foreground">
              {state.fileName}
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              Uploaded {formatTimestamp(state.timestamp)}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-chart-3/20 pt-4">
          {state.fileUrl && (
            <Button
              variant="outline"
              size="sm"
              disabled={opening}
              onClick={() => handleView(state.fileUrl)}
            >
              {opening ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ExternalLink className="size-3.5" />
              )}
              View your deck
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setState({ kind: 'empty' })}
          >
            <RefreshCw className="size-3.5" />
            Replace submission
          </Button>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      <FileUpload onFileSelected={handleFile} />
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}
