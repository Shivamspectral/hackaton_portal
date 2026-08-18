// Central, editable event configuration for V1.
// Static event content (identity, format, rules, timeline, announcements) lives
// here. Data-backed entities (problem statements, teams, submissions, scores)
// are served from Supabase via lib/api.ts.

import type { Announcement, TimelineStep } from './types'

export const EVENT = {
  name: 'HyperStack',
  fullName: 'HyperStack — SCOE Internal Hackathon',
  college: 'Siddhant College of Engineering',
  tagline: "Siddhant College of Engineering's Internal Smart India Hackathon",
  // Configurable countdown target (ISO string) — set to Evaluation Day.
  startDate: '2026-08-27T09:00:00',
  details: {
    date: 'August 27, 2026',
    venue: 'Central Seminar Hall, SCOE Campus, Sudumbare, Pune',
    duration: 'Registration to Results: Aug 10 – Aug 31, 2026',
    teamSize: '6 Members (minimum 1 female member mandatory)',
    registrationDeadline: 'August 26, 2026',
    eligibility: 'All SCOE undergraduate & postgraduate students',
  },
  about: [
    'HyperStack is Siddhant College of Engineering\u2019s internal Smart India Hackathon, bringing together the college\u2019s brightest student innovators to solve real-world problem statements. Teams pick a problem statement, build a working prototype, and pitch it to a panel of faculty and industry judges.',
    'There\u2019s no cash prize pool — the reward is the opportunity itself: the top team gets nominated to represent Siddhant College of Engineering at Smart India Hackathon (SIH) at the national level.',
  ],
  format: [
    {
      title: 'Form a Team',
      body: 'Register a squad of 6 from across SCOE, including at least 1 female member (mandatory).',
    },
    {
      title: 'Pick a Brief',
      body: 'Choose one problem statement from the open tracks. You can change your pick until PS selection closes.',
    },
    {
      title: 'Build & Submit',
      body: 'Build your solution and submit your final pitch deck (PPT/PPTX) before the submission deadline.',
    },
    {
      title: 'Present & Get Nominated',
      body: 'Present to the judging panel — the top team is nominated to represent SCOE at Smart India Hackathon (SIH) Nationals.',
    },
  ],
  rules: [
    'Teams must have exactly 6 registered members, including at least 1 female member (mandatory); the roster is locked once team formation closes.',
    'All work must be original and completed within the hackathon period — plagiarised or purchased solutions are not allowed.',
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
      body: 'Clarity of the pitch, the demo, and the team\u2019s answers under questioning.',
    },
  ],
  contact: {
    email: 'sonalirangdale127@gmail.com',
    phone: '+91 95525 07978',
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
    date: 'Aug 11–24, 2026',
    category: 'Tracks',
    title: 'New tracks & problem statements added',
    description:
      'Fresh tracks and additional problem statements are now live — explore them before you lock in your pick.',
  },
  {
    id: 'a2',
    date: 'Aug 10, 2026',
    category: 'Registration',
    title: 'Team registration is now open',
    description:
      'Register early — early birds get to pick their problem statement sooner and start building right away.',
  },
  {
    id: 'a3',
    date: 'Aug 10, 2026',
    category: 'Reward',
    title: 'Top team gets nominated to SIH Nationals',
    description:
      'There\u2019s no cash prize pool this year — the winning team earns the opportunity to represent Siddhant College of Engineering at Smart India Hackathon (SIH) at the national level.',
  },
  {
    id: 'a4',
    date: 'Aug 15, 2026',
    category: 'Mentorship',
    title: 'Mentor lineup announced',
    description:
      'SCOE faculty and alumni engineers will host office hours throughout the event.',
  },
]

// Static event timeline.
export const timeline: TimelineStep[] = [
  {
    id: 't1',
    label: 'Registration Opens',
    date: 'Aug 10',
    description: 'Sign up and build your team.',
    state: 'done',
  },
  {
    id: 't2',
    label: 'Team Formation',
    date: 'Aug 13',
    description: 'Finalize your roster of 6 (min. 1 female member).',
    state: 'done',
  },
  {
    id: 't3',
    label: 'PS Selection',
    date: 'Aug 15',
    description: 'Lock in your problem statement.',
    state: 'active',
  },
  {
    id: 't4',
    label: 'PPT Submission',
    date: 'Aug 26',
    description: 'Submit your final deck.',
    state: 'upcoming',
  },
  {
    id: 't5',
    label: 'Evaluation',
    date: 'Aug 27',
    description: 'Judges review submissions.',
    state: 'upcoming',
  },
  {
    id: 't6',
    label: 'Presentation',
    date: 'Aug 28',
    description: 'Present your solution to the judging panel.',
    state: 'upcoming',
  },
  {
    id: 't7',
    label: 'Results',
    date: 'Aug 31',
    description: 'Winners announced — top team nominated to SIH.',
    state: 'upcoming',
  },
]
