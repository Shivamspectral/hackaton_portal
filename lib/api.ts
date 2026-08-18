import 'server-only'

// Data-access layer for V1.
//
// Static event copy (announcements, timeline) lives in lib/config.ts and is
// returned as-is. Data-backed entities (problem statements, teams, rankings)
// are read from Supabase when a project is connected, and fall back to
// lib/mock-data.ts otherwise — so the app is always fully browsable, with or
// without a connected backend.
//
// This module is server-only (it uses the server Supabase client + cookies),
// so it can only be imported from Server Components / Server Actions. Client
// components that need to write data (e.g. file uploads) should use
// lib/submissions-client.ts instead.

import { announcements as staticAnnouncements, timeline as staticTimeline } from './config'
import {
  currentTeam,
  eventStats as mockEventStats,
  problemStatements as mockProblemStatements,
  rankings as mockRankings,
} from './mock-data'
import { getCurrentUser } from './supabase/auth'
import type {
  ProblemStatementRow,
  TeamProfileRow,
  TeamRankingRow,
  TeamRow,
} from './supabase/mappers'
import { mapProblemStatement, mapRanking, mapTeam } from './supabase/mappers'
import { createClient } from './supabase/server'
import type {
  Announcement,
  EventStat,
  ProblemStatement,
  RankingEntry,
  Team,
  TimelineStep,
} from './types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Simulate light network latency on the static/mock paths so loading states
// stay realistic even without a connected backend.
function delay<T>(data: T, ms = 0): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

// GET /api/announcements — static event copy, not Supabase-backed.
export async function getAnnouncements(): Promise<Announcement[]> {
  return delay(staticAnnouncements)
}

// GET /api/timeline — static event copy, not Supabase-backed.
export async function getTimeline(): Promise<TimelineStep[]> {
  return delay(staticTimeline)
}

// GET /api/stats — live counts when Supabase is connected, otherwise a
// representative mock snapshot.
export async function getEventStats(): Promise<EventStat[]> {
  const supabase = await createClient()
  if (!supabase) return delay(mockEventStats)

  try {
    const [teams, problemStatements, participants] = await Promise.all([
      supabase.from('teams').select('*', { count: 'exact', head: true }),
      supabase.from('problem_statements').select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'team'),
    ])

    return [
      {
        label: 'Participants',
        value: String(participants.count ?? 0),
        hint: 'Registered builders',
      },
      { label: 'Teams', value: String(teams.count ?? 0), hint: 'From SCOE' },
      {
        label: 'Problem Statements',
        value: String(problemStatements.count ?? 0),
        hint: 'Across open tracks',
      },
      { label: 'Reward', value: 'SIH Nomination', hint: 'Represent SCOE nationally' },
    ]
  } catch {
    return mockEventStats
  }
}

// GET /api/problem-statements
export async function getProblemStatements(): Promise<ProblemStatement[]> {
  const supabase = await createClient()
  if (!supabase) return delay(mockProblemStatements)

  try {
    const { data, error } = await supabase
      .from('problem_statements')
      .select('*, teams(count)')
      .order('ps_id', { ascending: true })

    if (error || !data) return mockProblemStatements
    return (data as ProblemStatementRow[]).map(mapProblemStatement)
  } catch {
    return mockProblemStatements
  }
}

// GET /api/problem-statements/:id  (accepts either the row id or the ps_id,
// e.g. "PS-101")
export async function getProblemStatement(
  id: string,
): Promise<ProblemStatement | undefined> {
  const fallback = () =>
    mockProblemStatements.find((ps) => ps.id === id || ps.psId === id)

  const supabase = await createClient()
  if (!supabase) return delay(fallback())

  try {
    const filter = UUID_RE.test(id)
      ? `id.eq.${id},ps_id.eq.${id}`
      : `ps_id.eq.${id}`

    const { data, error } = await supabase
      .from('problem_statements')
      .select('*, teams(count)')
      .or(filter)
      .maybeSingle()

    if (error || !data) return fallback()
    return mapProblemStatement(data as ProblemStatementRow)
  } catch {
    return fallback()
  }
}

// GET /api/rankings — reads the public, pre-aggregated team_rankings view so
// individual judge scores are never exposed.
export async function getRankings(): Promise<RankingEntry[]> {
  const supabase = await createClient()
  if (!supabase) return delay(mockRankings)

  try {
    const { data, error } = await supabase
      .from('team_rankings')
      .select('*')
      .order('rank', { ascending: true })

    if (error || !data) return mockRankings
    return (data as TeamRankingRow[]).map(mapRanking)
  } catch {
    return mockRankings
  }
}

// GET /api/team  (the authenticated team). Falls back to the demo team when
// signed out, unassigned, or Supabase isn't connected, so the dashboard is
// always browsable.
export async function getTeam(): Promise<Team> {
  const supabase = await createClient()
  if (!supabase) return delay(currentTeam)

  const user = await getCurrentUser()
  if (!user?.teamId) return currentTeam

  try {
    const { data: team, error } = await supabase
      .from('teams')
      .select(
        `id, team_code, name, leader_id, status,
         selected_ps:problem_statements!teams_selected_ps_id_fkey ( ps_id, title, category, status ),
         submission:submissions ( file_name, file_url, status, submitted_at )`,
      )
      .eq('id', user.teamId)
      .maybeSingle()

    if (error || !team) return currentTeam

    const { data: members } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('team_id', user.teamId)

    return mapTeam(
      team as unknown as TeamRow,
      (members as TeamProfileRow[] | null) ?? [],
    )
  } catch {
    return currentTeam
  }
}
