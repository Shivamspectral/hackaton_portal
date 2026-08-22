import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Custom problem statements get ps_id values like "CUSTOM-<team-uuid>-<n>"
// (see createCustomProblemStatement, lib/team/actions.ts) — this pulls out
// the friendly "Custom PS <n>" label for display, falling back to the raw
// psId if it doesn't match the expected shape.
export function customPsLabel(psId: string): string {
  const match = /-(\d+)$/.exec(psId)
  return match ? `Custom PS ${match[1]}` : psId
}
