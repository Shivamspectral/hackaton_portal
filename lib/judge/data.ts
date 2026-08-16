import 'server-only'

// Judge data-access layer. Assumes an authenticated judge session — the
// judge page goes through requireRole('judge') first, so Supabase is
// guaranteed connected by the time this runs.

import { getCurrentUser } from '@/lib/supabase/auth'
import { createRequiredClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types'

export interface JudgeEvaluation {
  innovation: number
  technical: number
  impact: number
  feasibility: number
  uiUx: number
  presentation: number
  totalScore: number
  feedback: string | null
}

export interface JudgeTeamRow {
  id: string
  teamCode: string
  teamName: string
  selectedPs: { psId: string; title: string; category: Category } | null
  submissionStatus: 'submitted' | 'none'
  myEvaluation: JudgeEvaluation | null
}

interface RawJudgeTeam {
  id: string
  team_code: string
  name: string
  selected_ps: { ps_id: string; title: string; category: string } | null
  submission: { status: string }[] | null
}

interface RawEvaluation {
  team_id: string
  innovation: number
  technical: number
  impact: number
  feasibility: number
  ui_ux: number
  presentation: number
  total_score: number
  feedback: string | null
}

// GET /api/judge/teams — every team, each annotated with this judge's own
// evaluation (if any). Aggregated/other judges' scores are never exposed
// here — only the public team_rankings view carries the aggregate.
export async function getJudgeTeams(): Promise<JudgeTeamRow[]> {
  const supabase = await createRequiredClient()
  const user = await getCurrentUser()

  const { data: teams, error } = await supabase
    .from('teams')
    .select(
      `id, team_code, name,
       selected_ps:problem_statements!teams_selected_ps_id_fkey ( ps_id, title, category ),
       submission:submissions ( status )`,
    )
    .order('team_code', { ascending: true })

  if (error || !teams) return []

  const { data: evaluations } = user
    ? await supabase
        .from('evaluations')
        .select(
          'team_id, innovation, technical, impact, feasibility, ui_ux, presentation, total_score, feedback',
        )
        .eq('judge_id', user.id)
    : { data: [] as RawEvaluation[] }

  const byTeam = new Map(
    ((evaluations as RawEvaluation[] | null) ?? []).map((e) => [e.team_id, e]),
  )

  return (teams as unknown as RawJudgeTeam[]).map((t) => {
    const evaluation = byTeam.get(t.id)
    return {
      id: t.id,
      teamCode: t.team_code,
      teamName: t.name,
      selectedPs: t.selected_ps
        ? {
            psId: t.selected_ps.ps_id,
            title: t.selected_ps.title,
            category: t.selected_ps.category as Category,
          }
        : null,
      submissionStatus: (t.submission?.[0]?.status as 'submitted' | 'none') ?? 'none',
      myEvaluation: evaluation
        ? {
            innovation: evaluation.innovation,
            technical: evaluation.technical,
            impact: evaluation.impact,
            feasibility: evaluation.feasibility,
            uiUx: evaluation.ui_ux,
            presentation: evaluation.presentation,
            totalScore: evaluation.total_score,
            feedback: evaluation.feedback,
          }
        : null,
    }
  })
}
