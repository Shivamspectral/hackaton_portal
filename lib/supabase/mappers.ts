// Maps raw Supabase rows (snake_case, DB-shaped) onto the camelCase domain
// types the UI already renders (lib/types.ts). Keeping this in one file means
// a schema change only ever touches this module, not every page/component.

import type {
  Category,
  Difficulty,
  ProblemStatement,
  PSStatus,
  RankingEntry,
  Team,
  TeamMember,
} from '@/lib/types'

// ---------------------------------------------------------------------------
// problem_statements
// ---------------------------------------------------------------------------

export interface ProblemStatementRow {
  id: string
  ps_id: string
  title: string
  organization: string
  category: string
  short_description: string
  description: string
  expected_solution: string
  requirements: string[] | null
  constraints: string[] | null
  tags: string[] | null
  difficulty: string
  status: string
  created_at?: string
  // Present when the query embeds the reverse `teams` relation as a count,
  // e.g. `.select('*, teams(count)')`.
  teams?: { count: number }[] | null
}

export function mapProblemStatement(row: ProblemStatementRow): ProblemStatement {
  return {
    id: row.id,
    psId: row.ps_id,
    title: row.title,
    organization: row.organization,
    category: row.category as Category,
    shortDescription: row.short_description,
    description: row.description,
    expectedSolution: row.expected_solution,
    requirements: row.requirements ?? [],
    constraints: row.constraints ?? [],
    tags: row.tags ?? [],
    difficulty: row.difficulty as Difficulty,
    status: row.status as PSStatus,
    teamsSelected: row.teams?.[0]?.count ?? 0,
  }
}

// ---------------------------------------------------------------------------
// public.team_rankings view
// ---------------------------------------------------------------------------

export interface TeamRankingRow {
  team_id: string
  team_code: string
  team_name: string
  problem_statement: string | null
  score: number
  status: string
  rank: number
}

export function mapRanking(row: TeamRankingRow): RankingEntry {
  return {
    rank: row.rank,
    teamId: row.team_code,
    team: row.team_name,
    problemStatement: row.problem_statement ?? '—',
    score: row.score,
    status: row.status as RankingEntry['status'],
  }
}

// ---------------------------------------------------------------------------
// teams (+ nested profiles / problem_statements / submissions), assembled
// into the shape the team dashboard renders.
// ---------------------------------------------------------------------------

export interface TeamProfileRow {
  id: string
  email: string | null
  full_name: string | null
}

export interface TeamRow {
  id: string
  team_code: string
  name: string
  leader_id: string | null
  status: string
  selected_ps?: {
    ps_id: string
    title: string
    category: string
    status: string
  } | null
  submission?: {
    file_name: string | null
    file_url: string | null
    status: string
    submitted_at: string | null
  }[] | null
}

function memberLabel(profile: TeamProfileRow, isLeader: boolean): TeamMember {
  const name = profile.full_name?.trim() || profile.email || 'Unnamed member'
  return {
    name,
    role: isLeader ? 'Team Lead' : 'Member',
    avatarSeed: profile.id,
  }
}

export function mapTeam(
  team: TeamRow,
  memberProfiles: TeamProfileRow[],
): Team {
  const leaderProfile = memberProfiles.find((p) => p.id === team.leader_id)
  const members = memberProfiles.length
    ? memberProfiles.map((p) => memberLabel(p, p.id === team.leader_id))
    : leaderProfile
      ? [memberLabel(leaderProfile, true)]
      : []

  const submissionRow = team.submission?.[0]
  const submission = {
    fileName: submissionRow?.file_name ?? '',
    status: (submissionRow?.status as 'submitted' | 'none') ?? 'none',
    timestamp: submissionRow?.submitted_at ?? null,
  }

  const hasSelectedProblem = !!team.selected_ps
  const teamFormed = members.length >= 2
  const submitted = submission.status === 'submitted'

  return {
    teamId: team.team_code,
    dbId: team.id,
    teamName: team.name,
    leader: leaderProfile?.full_name?.trim() || leaderProfile?.email || 'Unassigned',
    members,
    selectedProblem: team.selected_ps
      ? {
          psId: team.selected_ps.ps_id,
          title: team.selected_ps.title,
          category: team.selected_ps.category as Category,
          status: team.selected_ps.status,
        }
      : null,
    submission,
    progress: [
      { label: 'Registration', state: 'done' },
      { label: 'Team Formation', state: teamFormed ? 'done' : 'active' },
      {
        label: 'PS Selected',
        state: hasSelectedProblem ? 'done' : teamFormed ? 'active' : 'upcoming',
      },
      {
        label: 'PPT Submitted',
        state: submitted ? 'done' : hasSelectedProblem ? 'active' : 'upcoming',
      },
      { label: 'Evaluation', state: submitted ? 'active' : 'upcoming' },
    ],
  }
}
