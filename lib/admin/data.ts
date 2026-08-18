import 'server-only'

// Admin data-access layer. Every export here assumes an authenticated admin
// session — callers (admin pages/layout) go through requireRole('admin')
// first, so by the time these run Supabase is guaranteed to be connected.
// Reads run as the signed-in admin; RLS (0002_rls_and_storage.sql) is the
// backstop that actually enforces this — no service-role key is used here.

import type { ProblemStatementRow } from '@/lib/supabase/mappers'
import { mapProblemStatement } from '@/lib/supabase/mappers'
import { createRequiredClient } from '@/lib/supabase/server'
import type { ProblemStatement, Role } from '@/lib/types'

export interface AdminOverview {
  participants: number
  teams: number
  problemStatements: number
  submissions: number
  evaluationsSubmitted: number
}

// GET /api/admin/overview — top-line counts for the admin landing page.
export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = await createRequiredClient()

  const [participants, teams, problemStatements, submissions, evaluations] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'team'),
      supabase.from('teams').select('*', { count: 'exact', head: true }),
      supabase
        .from('problem_statements')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted'),
      supabase.from('evaluations').select('*', { count: 'exact', head: true }),
    ])

  return {
    participants: participants.count ?? 0,
    teams: teams.count ?? 0,
    problemStatements: problemStatements.count ?? 0,
    submissions: submissions.count ?? 0,
    evaluationsSubmitted: evaluations.count ?? 0,
  }
}

// GET /api/admin/problem-statements — full list for the manage table.
export async function getAdminProblemStatements(): Promise<ProblemStatement[]> {
  const supabase = await createRequiredClient()

  const { data, error } = await supabase
    .from('problem_statements')
    .select('*, teams(count)')
    .order('ps_id', { ascending: true })

  if (error || !data) return []
  return (data as ProblemStatementRow[]).map(mapProblemStatement)
}

export interface AdminTeamRow {
  id: string
  teamCode: string
  teamName: string
  status: string
  leaderName: string
  memberCount: number
  selectedPs: { id: string; psId: string; title: string } | null
  submissionStatus: 'submitted' | 'none'
  submissionFileName: string | null
  /** Storage object path (bucket-relative) — null when nothing's submitted. */
  submissionFileUrl: string | null
}

interface RawAdminTeam {
  id: string
  team_code: string
  name: string
  status: string
  leader_id: string | null
  selected_ps: { id: string; ps_id: string; title: string } | null
  submission: { status: string; file_name: string | null; file_url: string | null }[] | null
}

// GET /api/admin/teams — team list with leader, member count, selected PS
// and submission status, for the manage table.
export async function getAdminTeams(): Promise<AdminTeamRow[]> {
  const supabase = await createRequiredClient()

  const { data: teams, error } = await supabase
    .from('teams')
    .select(
      `id, team_code, name, status, leader_id,
       selected_ps:problem_statements!teams_selected_ps_id_fkey ( id, ps_id, title ),
       submission:submissions ( status, file_name, file_url )`,
    )
    .order('team_code', { ascending: true })

  if (error || !teams) return []

  const teamIds = (teams as unknown as RawAdminTeam[]).map((t) => t.id)
  const { data: members } = teamIds.length
    ? await supabase
        .from('profiles')
        .select('id, email, full_name, team_id')
        .in('team_id', teamIds)
    : { data: [] as { id: string; email: string | null; full_name: string | null; team_id: string | null }[] }

  return (teams as unknown as RawAdminTeam[]).map((t) => {
    const teamMembers = (members ?? []).filter((m) => m.team_id === t.id)
    const leader = teamMembers.find((m) => m.id === t.leader_id)
    return {
      id: t.id,
      teamCode: t.team_code,
      teamName: t.name,
      status: t.status,
      leaderName: leader?.full_name?.trim() || leader?.email || 'Unassigned',
      memberCount: teamMembers.length,
      selectedPs: t.selected_ps
        ? { id: t.selected_ps.id, psId: t.selected_ps.ps_id, title: t.selected_ps.title }
        : null,
      submissionStatus: (t.submission?.[0]?.status as 'submitted' | 'none') ?? 'none',
      submissionFileName: t.submission?.[0]?.file_name ?? null,
      submissionFileUrl: t.submission?.[0]?.file_url ?? null,
    }
  })
}

export interface AdminUserRow {
  id: string
  email: string
  fullName: string | null
  role: Role
  teamId: string | null
  teamCode: string | null
  teamName: string | null
}

interface RawAdminUser {
  id: string
  email: string | null
  full_name: string | null
  role: string
  team_id: string | null
  team: { team_code: string; name: string } | null
}

// GET /api/admin/users — every profile, with role + team, for the manage
// table.
export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = await createRequiredClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, team_id, team:teams ( team_code, name )')
    .order('email', { ascending: true })

  if (error || !data) return []

  return (data as unknown as RawAdminUser[]).map((row) => ({
    id: row.id,
    email: row.email ?? '—',
    fullName: row.full_name,
    role: row.role as Role,
    teamId: row.team_id,
    teamCode: row.team?.team_code ?? null,
    teamName: row.team?.name ?? null,
  }))
}

// Lightweight option lists for the assignment dropdowns on the teams/users
// tables.
export async function getAdminProblemStatementOptions(): Promise<
  { id: string; ps_id: string; title: string }[]
> {
  const supabase = await createRequiredClient()
  const { data } = await supabase
    .from('problem_statements')
    .select('id, ps_id, title')
    .order('ps_id', { ascending: true })
  return data ?? []
}

export async function getAdminTeamOptions(): Promise<
  { id: string; team_code: string; name: string }[]
> {
  const supabase = await createRequiredClient()
  const { data } = await supabase
    .from('teams')
    .select('id, team_code, name')
    .order('team_code', { ascending: true })
  return data ?? []
}
