# Supabase setup — HyperStack @ SCOE

The app talks to Supabase for every data-backed entity (problem statements,
teams, submissions, evaluations, rankings). Static event copy
(announcements, timeline, stats) still lives in `lib/config.ts`.

## 1. Environment variables

Set these in your Vercel project (and `.env.local` for local dev). They come
from **Supabase → Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

Only the **anon** key is used. There is no service-role key in this app — every
privileged write goes through a Next.js Server Action that runs as the signed-in
user, and Row Level Security decides what they're allowed to do. Never ship the
service-role key to the client.

## 2. Run the migrations in order

Open the **Supabase SQL Editor** and run these files **in order**:

1. `migrations/0001_schema.sql` — tables, triggers, `is_admin()` / `is_judge()`
   helpers, and the public `team_rankings` view.
2. `migrations/0002_rls_and_storage.sql` — enables Row Level Security, adds all
   policies, and creates the private `submissions` storage bucket + its policies.

> Run `0001` first. `0002` depends on the tables, helper functions and view it
> creates.

Optional, **dev only**: `migrations/9999_seed_dev_only.sql` seeds a few problem
statements and placeholder teams so the public pages aren't empty while you
build. It creates **no** auth users. **Delete this file before real event data
goes in.**

## 3. Bootstrap the first admin (one-time, manual)

New signups are **always** created with `role = 'team'` (enforced by the
`handle_new_user` trigger), and only an admin can promote anyone else. So the
very first admin has to be set by hand — there is no other way to create it:

1. Sign up once through the app's normal team signup (`/login`) with the email
   you want to be the admin.
2. In the Supabase SQL Editor, run:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = '<your-email>';
   ```

3. Sign out and back in (via `/staff-login`). You now land in the Admin UI at
   `/dashboard/admin`, where you can promote judges and other admins from the
   **Users** page — no more manual SQL needed.

## Role model

| role  | can do                                                                 |
|-------|------------------------------------------------------------------------|
| team  | pick a problem statement, submit their deck, see their own team        |
| judge | read all teams/submissions, score teams (one evaluation per team)      |
| admin | manage problem statements, teams, and user roles; read everything      |

All of the above is enforced in the database by the RLS policies in `0002`, not
just in the UI.
