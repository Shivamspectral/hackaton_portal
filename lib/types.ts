// Shared domain types for the hackathon platform.
// These mirror the shapes that future REST endpoints will return.

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type PSStatus = 'Open' | 'Filling Fast' | 'Closed'

export type Category =
  | 'AI / ML'
  | 'Web Development'
  | 'Cybersecurity'
  | 'FinTech'
  | 'HealthTech'
  | 'Sustainability'
  | 'Smart Cities'
  | 'Education'
  | 'Robotics'

export interface ProblemStatement {
  id: string
  psId: string
  title: string
  organization: string
  category: Category
  shortDescription: string
  description: string
  expectedSolution: string
  requirements: string[]
  constraints: string[]
  tags: string[]
  difficulty: Difficulty
  status: PSStatus
  teamsSelected: number
  /** True for a team-authored brief (not visible in the public browse list). */
  isCustom: boolean
  /** teams.id of the team that authored this brief — set only when isCustom. */
  createdByTeamId: string | null
}

export interface Announcement {
  id: string
  date: string
  category: string
  title: string
  description: string
}

export interface TimelineStep {
  id: string
  label: string
  date: string
  description: string
  state: 'done' | 'active' | 'upcoming'
}

export interface RankingEntry {
  rank: number
  teamId: string
  team: string
  problemStatement: string
  score: number
  status: 'Finalist' | 'Qualified' | 'Active' | 'Eliminated'
}

export interface EventStat {
  label: string
  value: string
  hint: string
}

export interface TeamMember {
  name: string
  role: string
  avatarSeed: string
}

export interface Submission {
  fileName: string
  /** Storage object path (bucket-relative), used to mint a signed download URL. Empty when nothing's submitted. */
  fileUrl: string
  status: 'submitted' | 'none'
  timestamp: string | null
}

export interface Team {
  /** Display code, e.g. "SCOE-01" (teams.team_code). */
  teamId: string
  /** Internal Supabase id (teams.id, a uuid). Undefined when running on mock data. */
  dbId?: string
  teamName: string
  leader: string
  /** profiles.id (uuid) of the leader — undefined on mock data. Used to gate the "Delete team" action to the actual leader instead of matching on display name. */
  leaderId?: string
  members: TeamMember[]
  selectedProblem: {
    psId: string
    title: string
    category: Category
    status: string
  } | null
  submission: Submission
  progress: {
    label: string
    state: 'done' | 'active' | 'upcoming'
  }[]
}

export type Role = 'team' | 'admin' | 'judge'
