-- ============================================================================
-- HyperStack @ SCOE — DEV-ONLY SEED  (NOT part of 0001/0002)
--
-- ⚠️  Delete this file (and do NOT run it) before real event data goes in.
--     It only seeds problem statements + a few placeholder teams so the
--     public pages have something to render during development. It never
--     creates auth users, judges or admins — those come from real signups
--     and the Admin UI / first-admin bootstrap (see README).
--
-- Safe to run multiple times: everything is idempotent on ps_id / team_code.
-- ============================================================================

-- --- Problem statements ----------------------------------------------------
insert into public.problem_statements
  (ps_id, title, organization, category, short_description, description,
   expected_solution, requirements, constraints, tags, difficulty, status)
values
  ('PS-101',
   'Autonomous Triage Assistant for Rural Clinics',
   'HealthBridge Foundation', 'HealthTech',
   'An offline-first assistant that helps under-staffed clinics prioritize patients by severity.',
   'Rural clinics often operate with a single physician serving hundreds of patients daily. Build an intelligent triage assistant that works with intermittent connectivity, ingests basic vitals and symptoms, and produces a prioritized queue with explainable reasoning.',
   'A responsive app with an on-device inference layer, a clear triage queue, and a clinician override workflow. Explainability is mandatory.',
   array['Works offline with later sync','Explainable severity scoring','Clinician override + audit log'],
   array['No storage of PII beyond the session','Inference under 2s on mid-range hardware'],
   array['Offline-first','Inference','Healthcare'],
   'Advanced', 'Filling Fast'),
  ('PS-102',
   'Fraud Signal Explorer for Micro-Lending',
   'FinServe Labs', 'FinTech',
   'A dashboard that surfaces fraud signals across micro-loan applications in real time.',
   'Micro-lending platforms process thousands of small applications where fraud is subtle and distributed. Aggregate weak signals into an interpretable risk view.',
   'A real-time analyst dashboard with signal aggregation, cluster views, and case management.',
   array['Real-time signal aggregation','Interpretable risk scores','Case investigation workflow'],
   array['Handle 10k+ applications smoothly','No black-box-only scoring'],
   array['Dashboards','Risk','Real-time'],
   'Intermediate', 'Open'),
  ('PS-103',
   'Zero-Trust Access for Campus Networks',
   'SecureEdge', 'Cybersecurity',
   'A lightweight zero-trust access layer for shared campus lab machines.',
   'Campus labs share machines across hundreds of students, creating a messy trust boundary. Prototype a zero-trust access layer with short-lived credentials and device posture checks.',
   'A working prototype with short-lived tokens, posture checks, and an admin console showing live sessions and revocation.',
   array['Short-lived credentials','Device posture verification','Live session revocation'],
   array['No always-on agent heavier than 30MB','Must degrade gracefully offline'],
   array['Zero-Trust','Auth','Networking'],
   'Advanced', 'Open'),
  ('PS-104',
   'Adaptive Learning Paths for STEM',
   'EduForward', 'Education',
   'A learner-aware system that reshapes STEM lesson order based on mastery.',
   'Fixed curricula ignore how individual students actually learn. Model mastery per concept and dynamically re-sequence lessons and practice.',
   'An interactive learner dashboard with a mastery graph, adaptive sequencing, and teacher visibility.',
   array['Per-concept mastery model','Adaptive sequencing','Teacher dashboard'],
   array['Cold-start friendly','Works for classes of 40+'],
   array['EdTech','Personalization','Graphs'],
   'Intermediate', 'Filling Fast')
on conflict (ps_id) do nothing;

-- --- Placeholder teams (no auth users attached; leader_id left null) --------
insert into public.teams (team_code, name, selected_ps_id, status)
select v.team_code, v.name, ps.id, v.status
from (values
  ('SCOE-01', 'Ctrl Alt Elite', 'PS-104', 'Active'),
  ('SCOE-02', 'Segfault Squad', 'PS-101', 'Qualified'),
  ('SCOE-03', 'Race Condition', 'PS-103', 'Active')
) as v(team_code, name, ps_id, status)
left join public.problem_statements ps on ps.ps_id = v.ps_id
on conflict (team_code) do nothing;
