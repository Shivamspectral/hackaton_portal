// Central, editable event configuration for V1.
// Static event content (identity, format, rules, timeline, announcements) lives
// here. Data-backed entities (problem statements, teams, submissions, scores)
// are served from Supabase via lib/api.ts.

import type { Announcement, TimelineStep } from './types'

export const EVENT = {
  name: 'HyperStack',
  fullName: 'HyperStack — SCOE Internal Hackathon',
  college: 'Siddhant College of Engineering',
  tagline: 'A 36-hour build sprint at Siddhant College of Engineering',
  // Configurable countdown target (ISO string). Change to your real event start.
  startDate: '2026-11-14T09:00:00',
  details: {
    date: 'November 14–15, 2026',
    venue: 'Central Seminar Hall, SCOE Campus, Sudumbare, Pune',
    duration: '36 Hours',
    teamSize: '2–4 Members',
    registrationDeadline: 'November 1, 2026',
    eligibility: 'All SCOE undergraduate & postgraduate students',
  },
  about: [
    'HyperStack is a 36-hour internal hackathon at Siddhant College of Engineering that brings together the sharpest student builders on campus to ship real solutions to real briefs. Teams pick a problem statement, build a working prototype, and pitch it to a panel of faculty and industry judges.',
    'It is run like a shared engineering workspace: clear briefs, honest constraints, mentor office hours, and a leaderboard that reflects the work — not the noise.',
  ],
  format: [
    {
      title: 'Form a Team',
      body: 'Register a squad of 2–4 from across SCOE. Solo builders can find teammates during team formation.',
    },
    {
      title: 'Pick a Brief',
      body: 'Choose one problem statement from the open tracks. You can change your pick until PS selection closes.',
    },
    {
      title: 'Build for 36 Hours',
      body: 'Ship a working prototype on-site with mentor support throughout the sprint.',
    },
    {
      title: 'Pitch & Submit',
      body: 'Submit your deck, demo to judges, and defend your build in a short Q&A.',
    },
  ],
  rules: [
    'Teams must have 2 to 4 registered members; the roster is locked once team formation closes.',
    'All core code must be written during the event window — pre-built boilerplate is allowed if disclosed.',
    'Open-source libraries and public APIs are permitted; plagiarised or purchased solutions are not.',
    'Each team works on exactly one problem statement at a time.',
    'Your final pitch deck (PPT/PPTX) must be submitted before the submission deadline.',
    'Be respectful — harassment or unsafe conduct results in immediate disqualification.',
  ],
  evaluation: [
    {
      title: 'Problem Fit',
      body: 'How directly the solution addresses the brief and its stated constraints.',
    },
    {
      title: 'Technical Execution',
      body: 'Working prototype quality, engineering rigor, and complexity handled well.',
    },
    {
      title: 'Innovation',
      body: 'Originality of the approach and the insight behind it.',
    },
    {
      title: 'Impact & Feasibility',
      body: 'Real-world usefulness and how realistically it can ship beyond the demo.',
    },
    {
      title: 'Presentation',
      body: 'Clarity of the pitch, the demo, and the team’s answers under questioning.',
    },
  ],
  contact: {
    email: 'hackathon@siddhantcoe.edu.in',
    phone: '+91 98765 43210',
  },
  social: {
    twitter: '#',
    github: '#',
    instagram: '#',
    linkedin: '#',
  },
} as const

// Static announcements shown on the home page and team dashboard.
export const announcements: Announcement[] = [
  {
    id: 'a1',
    date: 'Oct 20, 2026',
    category: 'Registration',
    title: 'Team registration is now open',
    description:
      'Form your squad of 2–4 and lock your slot. Early registrants get priority mentor access.',
  },
  {
    id: 'a2',
    date: 'Oct 18, 2026',
    category: 'Tracks',
    title: 'New Robotics track added',
    description:
      'A dedicated hardware + autonomy track hosted by the SCOE Robotics lab is now live.',
  },
  {
    id: 'a3',
    date: 'Oct 12, 2026',
    category: 'Mentorship',
    title: 'Mentor lineup announced',
    description:
      'SCOE faculty and alumni engineers will host office hours throughout the event.',
  },
  {
    id: 'a4',
    date: 'Oct 05, 2026',
    category: 'Prizes',
    title: 'Prize pool confirmed',
    description:
      'Track-wise prizes, certificates, and cloud credits have been confirmed for finalists.',
  },
]

// Static event timeline.
export const timeline: TimelineStep[] = [
  {
    id: 't1',
    label: 'Registration Opens',
    date: 'Oct 10',
    description: 'Sign up and build your team.',
    state: 'done',
  },
  {
    id: 't2',
    label: 'Team Formation',
    date: 'Oct 25',
    description: 'Finalize your roster of 2–4.',
    state: 'done',
  },
  {
    id: 't3',
    label: 'PS Selection',
    date: 'Nov 05',
    description: 'Lock in your problem statement.',
    state: 'active',
  },
  {
    id: 't4',
    label: 'Hackathon Begins',
    date: 'Nov 14',
    description: '36 hours of building starts.',
    state: 'upcoming',
  },
  {
    id: 't5',
    label: 'PPT Submission',
    date: 'Nov 15',
    description: 'Submit your final deck.',
    state: 'upcoming',
  },
  {
    id: 't6',
    label: 'Evaluation',
    date: 'Nov 15',
    description: 'Judges review submissions.',
    state: 'upcoming',
  },
  {
    id: 't7',
    label: 'Results',
    date: 'Nov 16',
    description: 'Winners announced live.',
    state: 'upcoming',
  },
]
