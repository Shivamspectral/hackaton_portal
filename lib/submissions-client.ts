'use client'

// Client-side submission upload. This can't live in lib/api.ts because it
// needs the browser Supabase client (cookies + a real File object) — api.ts
// is server-only. RLS (submissions_insert_own_team /
// submissions_obj_insert_own_team) enforces that a team can only write under
// its own team_id.

import { createClient } from '@/lib/supabase/client'

const BUCKET = 'submissions'

export interface UploadSubmissionResult {
  ok: boolean
  fileName: string
  /** Storage object path (bucket-relative) — empty in the mock/no-Supabase path. */
  fileUrl: string
  timestamp: string
  error?: string
}

function delay<T>(data: T, ms = 0): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

// POST /api/submissions — uploads the deck to the private `submissions`
// storage bucket (namespaced by team.dbId) and upserts the submissions row.
// teamDbId is the internal Supabase teams.id (uuid) — NOT the display
// team_code.
export async function uploadSubmission(
  teamDbId: string | undefined,
  file: File,
): Promise<UploadSubmissionResult> {
  const supabase = createClient()

  // No connected Supabase project (or no known team id) — simulate success
  // so the demo/mock experience still works end-to-end.
  if (!supabase || !teamDbId) {
    return delay(
      { ok: true, fileName: file.name, fileUrl: '', timestamp: new Date().toISOString() },
      900,
    )
  }

  const path = `${teamDbId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true })

  if (uploadError) {
    return {
      ok: false,
      fileName: file.name,
      fileUrl: '',
      timestamp: new Date().toISOString(),
      error: uploadError.message,
    }
  }

  const timestamp = new Date().toISOString()

  const { error: dbError } = await supabase.from('submissions').upsert(
    {
      team_id: teamDbId,
      file_name: file.name,
      file_url: path,
      status: 'submitted',
      submitted_at: timestamp,
    },
    { onConflict: 'team_id' },
  )

  if (dbError) {
    return { ok: false, fileName: file.name, fileUrl: '', timestamp, error: dbError.message }
  }

  return { ok: true, fileName: file.name, fileUrl: path, timestamp }
}

// Generates a short-lived signed URL to view/download a stored submission.
// Works for the owning team (their own object) and for admins/judges (whose
// storage policies allow reading any team's submissions).
export async function getSubmissionDownloadUrl(
  path: string,
): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 10)

  if (error) return null
  return data.signedUrl
}
