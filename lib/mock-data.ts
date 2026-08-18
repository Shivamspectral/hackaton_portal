import type {
  Announcement,
  EventStat,
  ProblemStatement,
  RankingEntry,
  Team,
  TimelineStep,
} from './types'

export const eventStats: EventStat[] = [
  { label: 'Participants', value: '1,284', hint: 'Registered builders' },
  { label: 'Teams', value: '372', hint: 'From 96 colleges' },
  { label: 'Problem Statements', value: '24', hint: 'Across 9 tracks' },
  { label: 'Reward', value: 'SIH Nomination', hint: 'Represent SCOE nationally' },
]

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
      'A dedicated hardware + autonomy track sponsored by our robotics partners is now live.',
  },
  {
    id: 'a3',
    date: 'Oct 12, 2026',
    category: 'Mentorship',
    title: 'Mentor lineup announced',
    description:
      'Engineers from leading product companies will host office hours throughout the event.',
  },
  {
    id: 'a4',
    date: 'Oct 05, 2026',
    category: 'Prizes',
    title: 'Prize pool increased to ₹5L',
    description:
      'Additional track-wise prizes and cloud credits have been added for finalists.',
  },
]

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

export const problemStatements: ProblemStatement[] = [
  {
    id: '1',
    psId: 'PS-101',
    title: 'Autonomous Triage Assistant for Rural Clinics',
    organization: 'HealthBridge Foundation',
    category: 'HealthTech',
    shortDescription:
      'An offline-first assistant that helps under-staffed clinics prioritize patients by severity.',
    description:
      'Rural clinics often operate with a single physician serving hundreds of patients daily. Build an intelligent triage assistant that works with intermittent connectivity, ingests basic vitals and symptoms, and produces a prioritized queue with explainable reasoning for each recommendation.',
    expectedSolution:
      'A responsive web or mobile app with an on-device inference layer, a clear triage queue, and a clinician override workflow. Explainability is mandatory.',
    requirements: [
      'Works offline with later sync',
      'Explainable severity scoring',
      'Clinician override + audit log',
      'Accessible on low-end devices',
    ],
    constraints: [
      'No storage of PII beyond the session',
      'Inference must run under 2s on mid-range hardware',
    ],
    tags: ['Offline-first', 'Inference', 'Accessibility', 'Healthcare'],
    difficulty: 'Advanced',
    status: 'Filling Fast',
    teamsSelected: 14,
  },
  {
    id: '2',
    psId: 'PS-102',
    title: 'Fraud Signal Explorer for Micro-Lending',
    organization: 'FinServe Labs',
    category: 'FinTech',
    shortDescription:
      'A dashboard that surfaces fraud signals across micro-loan applications in real time.',
    description:
      'Micro-lending platforms process thousands of small applications where fraud is subtle and distributed. Build a tool that aggregates weak signals into an interpretable risk view, letting analysts investigate clusters and act quickly.',
    expectedSolution:
      'A real-time analyst dashboard with signal aggregation, cluster views, and case management. Bonus for a feedback loop that improves scoring.',
    requirements: [
      'Real-time signal aggregation',
      'Interpretable risk scores',
      'Case investigation workflow',
    ],
    constraints: ['Handle 10k+ applications smoothly', 'No black-box-only scoring'],
    tags: ['Dashboards', 'Risk', 'Real-time', 'Analytics'],
    difficulty: 'Intermediate',
    status: 'Open',
    teamsSelected: 8,
  },
  {
    id: '3',
    psId: 'PS-103',
    title: 'Zero-Trust Access for Campus Networks',
    organization: 'SecureEdge',
    category: 'Cybersecurity',
    shortDescription:
      'A lightweight zero-trust access layer for shared campus lab machines.',
    description:
      'Campus labs share machines across hundreds of students, creating a messy trust boundary. Design and prototype a zero-trust access layer with short-lived credentials, device posture checks, and a clean admin console.',
    expectedSolution:
      'A working prototype with short-lived tokens, posture checks, and an admin console showing live sessions and revocation.',
    requirements: [
      'Short-lived credentials',
      'Device posture verification',
      'Live session revocation',
    ],
    constraints: ['No always-on agent heavier than 30MB', 'Must degrade gracefully offline'],
    tags: ['Zero-Trust', 'Auth', 'Networking'],
    difficulty: 'Advanced',
    status: 'Open',
    teamsSelected: 5,
  },
  {
    id: '4',
    psId: 'PS-104',
    title: 'Adaptive Learning Paths for STEM',
    organization: 'EduForward',
    category: 'Education',
    shortDescription:
      'A learner-aware system that reshapes STEM lesson order based on mastery.',
    description:
      'Fixed curricula ignore how individual students actually learn. Build a system that models mastery per concept and dynamically re-sequences lessons and practice to close gaps efficiently.',
    expectedSolution:
      'An interactive learner dashboard with a mastery graph, adaptive sequencing, and teacher visibility.',
    requirements: ['Per-concept mastery model', 'Adaptive sequencing', 'Teacher dashboard'],
    constraints: ['Cold-start friendly', 'Works for classes of 40+'],
    tags: ['EdTech', 'Personalization', 'Graphs'],
    difficulty: 'Intermediate',
    status: 'Filling Fast',
    teamsSelected: 11,
  },
  {
    id: '5',
    psId: 'PS-105',
    title: 'Real-Time Transit Load Balancer',
    organization: 'UrbanFlow',
    category: 'Smart Cities',
    shortDescription:
      'Predict and rebalance public transit crowding before it happens.',
    description:
      'City buses swing between empty and overcrowded within a single route. Build a system that forecasts load per stop and suggests dispatch adjustments to smooth demand across the network.',
    expectedSolution:
      'A control-room view with per-stop load forecasts and actionable dispatch suggestions.',
    requirements: ['Per-stop load forecasting', 'Dispatch suggestions', 'Map-based control view'],
    constraints: ['Handle live GPS streams', 'Sub-minute refresh'],
    tags: ['Forecasting', 'Maps', 'Real-time'],
    difficulty: 'Advanced',
    status: 'Open',
    teamsSelected: 6,
  },
  {
    id: '6',
    psId: 'PS-106',
    title: 'Carbon-Aware Compute Scheduler',
    organization: 'GreenGrid',
    category: 'Sustainability',
    shortDescription:
      'Schedule batch jobs when and where the grid is cleanest.',
    description:
      'Batch workloads can run anytime, yet they usually run on dirty power. Build a scheduler that shifts non-urgent jobs to greener time windows and regions, quantifying the carbon saved.',
    expectedSolution:
      'A scheduler with a policy UI, a carbon-savings report, and a simple job submission API.',
    requirements: ['Carbon-aware scheduling policy', 'Savings reporting', 'Job submission API'],
    constraints: ['Respect job deadlines', 'Transparent assumptions'],
    tags: ['Green', 'Scheduling', 'APIs'],
    difficulty: 'Intermediate',
    status: 'Open',
    teamsSelected: 4,
  },
  {
    id: '7',
    psId: 'PS-107',
    title: 'Conversational Analytics for Non-Technical Teams',
    organization: 'DataDesk',
    category: 'AI / ML',
    shortDescription:
      'Let ops teams query their own data in plain language, safely.',
    description:
      'Non-technical teams wait days for simple data answers. Build a natural-language analytics layer that translates questions into safe, sandboxed queries with clear result explanations and guardrails.',
    expectedSolution:
      'A chat-style analytics surface with query previews, sandboxing, and result explanations.',
    requirements: ['NL-to-query translation', 'Query sandboxing', 'Result explanations'],
    constraints: ['No destructive queries', 'Query preview before run'],
    tags: ['NLP', 'Analytics', 'Guardrails'],
    difficulty: 'Advanced',
    status: 'Filling Fast',
    teamsSelected: 17,
  },
  {
    id: '8',
    psId: 'PS-108',
    title: 'Component Library Migration Copilot',
    organization: 'BuildStack',
    category: 'Web Development',
    shortDescription:
      'Assist teams migrating between UI component libraries with confidence.',
    description:
      'Large frontends get stuck on outdated component libraries. Build a copilot that maps components between libraries, flags risky migrations, and previews changes before they land.',
    expectedSolution:
      'A migration workspace with component mapping, risk flags, and side-by-side previews.',
    requirements: ['Component mapping', 'Risk flagging', 'Visual diff preview'],
    constraints: ['Framework-agnostic core', 'No auto-merge without review'],
    tags: ['Frontend', 'Tooling', 'DX'],
    difficulty: 'Beginner',
    status: 'Open',
    teamsSelected: 3,
  },
  {
    id: '9',
    psId: 'PS-109',
    title: 'Warehouse Pick-Path Optimizer',
    organization: 'RoboLogix',
    category: 'Robotics',
    shortDescription:
      'Coordinate autonomous pickers to minimize collisions and travel time.',
    description:
      'Autonomous warehouse robots waste time in congestion and near-misses. Build a coordination layer that plans pick paths, resolves conflicts, and adapts to live floor changes.',
    expectedSolution:
      'A simulation showing multi-robot path planning, conflict resolution, and live re-planning.',
    requirements: ['Multi-agent path planning', 'Conflict resolution', 'Live re-planning'],
    constraints: ['Real-time performance', 'Deterministic replays for grading'],
    tags: ['Robotics', 'Planning', 'Simulation'],
    difficulty: 'Advanced',
    status: 'Open',
    teamsSelected: 2,
  },
  {
    id: '10',
    psId: 'PS-110',
    title: 'Accessible Component Playground for Screen Readers',
    organization: 'BuildStack',
    category: 'Web Development',
    shortDescription:
      'A playground that audits UI components for screen-reader and keyboard accessibility in real time.',
    description:
      'Teams ship inaccessible components without realizing it. Build a live playground that renders a component, simulates assistive-tech traversal, and surfaces concrete, prioritized fixes with code snippets.',
    expectedSolution:
      'An interactive editor with a live preview, an accessibility tree view, and an actionable issue list with suggested fixes.',
    requirements: [
      'Live accessibility tree',
      'Keyboard traversal simulation',
      'Prioritized, actionable fixes',
    ],
    constraints: ['No paid a11y APIs', 'Works for React & plain HTML'],
    tags: ['Accessibility', 'Frontend', 'DX'],
    difficulty: 'Beginner',
    status: 'Open',
    teamsSelected: 7,
  },
  {
    id: '11',
    psId: 'PS-111',
    title: 'On-Device Symptom Checker for Low Bandwidth',
    organization: 'HealthBridge Foundation',
    category: 'HealthTech',
    shortDescription:
      'A tiny, on-device symptom checker that works with zero connectivity.',
    description:
      'Patients in remote regions cannot rely on cloud APIs. Build a compact, on-device symptom checker with a guided flow, plain-language output, and a clear escalation path to a human clinician.',
    expectedSolution:
      'A lightweight PWA with an offline model, a guided questionnaire, and clear next-step guidance.',
    requirements: ['Fully offline flow', 'Plain-language output', 'Escalation path'],
    constraints: ['Under 5MB bundle', 'No PII leaves the device'],
    tags: ['Offline-first', 'PWA', 'Healthcare'],
    difficulty: 'Intermediate',
    status: 'Open',
    teamsSelected: 5,
  },
  {
    id: '12',
    psId: 'PS-112',
    title: 'Explainable Credit Scoring Sandbox',
    organization: 'FinServe Labs',
    category: 'FinTech',
    shortDescription:
      'Let analysts probe and explain credit decisions with counterfactuals.',
    description:
      'Opaque credit models create disputes and regulatory risk. Build a sandbox where analysts inspect a decision, see the top contributing factors, and generate "what would change this" counterfactuals.',
    expectedSolution:
      'A decision-inspection UI with factor attributions and interactive counterfactual exploration.',
    requirements: ['Per-decision attributions', 'Counterfactual generation', 'Audit export'],
    constraints: ['No black-box-only output', 'Deterministic explanations'],
    tags: ['Explainability', 'Risk', 'Analytics'],
    difficulty: 'Advanced',
    status: 'Filling Fast',
    teamsSelected: 13,
  },
  {
    id: '13',
    psId: 'PS-113',
    title: 'Campus Energy Twin',
    organization: 'GreenGrid',
    category: 'Sustainability',
    shortDescription:
      'A live digital twin that models and nudges campus energy usage down.',
    description:
      'Campuses waste energy with no shared visibility. Build a digital twin that ingests meter data, visualizes consumption by building, and recommends concrete, ranked interventions with projected savings.',
    expectedSolution:
      'A dashboard twin with per-building consumption, anomaly flags, and ranked savings recommendations.',
    requirements: ['Per-building modeling', 'Anomaly detection', 'Ranked interventions'],
    constraints: ['Handle sparse meter data', 'Transparent savings math'],
    tags: ['Digital Twin', 'Green', 'Dashboards'],
    difficulty: 'Intermediate',
    status: 'Open',
    teamsSelected: 4,
  },
  {
    id: '14',
    psId: 'PS-114',
    title: 'Phishing Drill Simulator for Student Bodies',
    organization: 'SecureEdge',
    category: 'Cybersecurity',
    shortDescription:
      'Run safe, consent-based phishing drills and turn results into training.',
    description:
      'Students are the softest target on any campus network. Build a consent-based drill platform that runs simulated phishing, measures susceptibility without shaming individuals, and routes weak spots into micro-training.',
    expectedSolution:
      'An admin console for drills, aggregate (non-individual) reporting, and adaptive micro-training modules.',
    requirements: ['Consent-based drills', 'Aggregate-only reporting', 'Adaptive training'],
    constraints: ['No individual shaming', 'Full audit trail'],
    tags: ['Security', 'Training', 'Awareness'],
    difficulty: 'Intermediate',
    status: 'Closed',
    teamsSelected: 20,
  },
  {
    id: '15',
    psId: 'PS-115',
    title: 'Peer-Review Grader for Large STEM Classes',
    organization: 'EduForward',
    category: 'Education',
    shortDescription:
      'Calibrated peer review that scales grading for classes of hundreds.',
    description:
      'Instructors cannot hand-grade open-ended work at scale. Build a calibrated peer-review system that trains reviewers on rubrics, detects outlier scores, and produces defensible aggregate grades.',
    expectedSolution:
      'A reviewer workflow with rubric calibration, outlier detection, and instructor override.',
    requirements: ['Rubric calibration', 'Outlier detection', 'Instructor override'],
    constraints: ['Anonymized reviews', 'Explainable aggregate scores'],
    tags: ['EdTech', 'Assessment', 'Fairness'],
    difficulty: 'Beginner',
    status: 'Open',
    teamsSelected: 6,
  },
]

export const rankings: RankingEntry[] = [
  {
    rank: 1,
    teamId: 'T-014',
    team: 'Null Pointer Exception',
    problemStatement: 'PS-107',
    score: 982,
    status: 'Finalist',
  },
  {
    rank: 2,
    teamId: 'T-032',
    team: 'Segfault Squad',
    problemStatement: 'PS-101',
    score: 964,
    status: 'Finalist',
  },
  {
    rank: 3,
    teamId: 'T-007',
    team: 'Race Condition',
    problemStatement: 'PS-103',
    score: 951,
    status: 'Finalist',
  },
  {
    rank: 4,
    teamId: 'T-041',
    team: 'Kernel Panic',
    problemStatement: 'PS-104',
    score: 933,
    status: 'Qualified',
  },
  {
    rank: 5,
    teamId: 'T-019',
    team: 'Stack Overflow',
    problemStatement: 'PS-102',
    score: 921,
    status: 'Qualified',
  },
  {
    rank: 6,
    teamId: 'T-023',
    team: 'Merge Conflict',
    problemStatement: 'PS-105',
    score: 908,
    status: 'Qualified',
  },
  {
    rank: 7,
    teamId: 'T-051',
    team: 'Ctrl Alt Elite',
    problemStatement: 'PS-108',
    score: 896,
    status: 'Active',
  },
  {
    rank: 8,
    teamId: 'T-063',
    team: 'The Binary Brains',
    problemStatement: 'PS-106',
    score: 884,
    status: 'Active',
  },
  {
    rank: 9,
    teamId: 'T-077',
    team: 'Recursion Rangers',
    problemStatement: 'PS-109',
    score: 871,
    status: 'Active',
  },
  {
    rank: 10,
    teamId: 'T-088',
    team: 'Async Avengers',
    problemStatement: 'PS-107',
    score: 859,
    status: 'Active',
  },
]

// The signed-in team for the demo dashboard.
export const currentTeam: Team = {
  teamId: 'T-051',
  teamName: 'Ctrl Alt Elite',
  leader: 'Aarav Mehta',
  members: [
    { name: 'Aarav Mehta', role: 'Team Lead · Full-stack', avatarSeed: 'aarav' },
    { name: 'Diya Sharma', role: 'ML Engineer', avatarSeed: 'diya' },
    { name: 'Kabir Rao', role: 'Frontend', avatarSeed: 'kabir' },
    { name: 'Isha Nair', role: 'Design / UX', avatarSeed: ' isha' },
  ],
  selectedProblem: {
    psId: 'PS-108',
    title: 'Component Library Migration Copilot',
    category: 'Web Development',
    status: 'Locked',
  },
  submission: {
    fileName: '',
    status: 'none',
    timestamp: null,
  },
  progress: [
    { label: 'Registration', state: 'done' },
    { label: 'Team Formation', state: 'done' },
    { label: 'PS Selected', state: 'done' },
    { label: 'PPT Submitted', state: 'active' },
    { label: 'Evaluation', state: 'upcoming' },
  ],
}

export const categories = [
  'AI / ML',
  'Web Development',
  'Cybersecurity',
  'FinTech',
  'HealthTech',
  'Sustainability',
  'Smart Cities',
  'Education',
  'Robotics',
] as const
