# Supabase Migrations

This folder stores SQL migrations applied to the Supabase project.

## Current migration
- `20260310043500_create_waitlist_entries.sql`: creates `public.waitlist_entries`.
- `20260310050000_create_event_log.sql`: creates `public.event_log`.
- `20260310052000_create_free_runs.sql`: creates `public.free_runs`.

## How to apply

### Option 1: Supabase SQL Editor (quick)
1. Open Supabase Dashboard -> SQL Editor.
2. Paste migration file content.
3. Run.

### Option 2: Supabase CLI (recommended as project grows)
1. Install CLI: `brew install supabase/tap/supabase`.
2. Authenticate: `supabase login`.
3. Link project: `supabase link --project-ref <your-project-ref>`.
4. Apply local migrations: `supabase db push`.

## Notes
- `waitlist_entries_email_idx` enforces case-insensitive unique e-mail.
- API returns `409` when e-mail already exists.
- `event_log` stores lightweight product events (e.g. `waitlist_submitted`) for funnel analysis.
- `free_runs` stores anonymous metadata for free converter usage (no markdown/image content).
