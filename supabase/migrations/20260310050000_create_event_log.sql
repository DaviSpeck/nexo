-- Product/application events for lightweight funnel analysis.
-- Safe to run multiple times.

create extension if not exists pgcrypto;

create table if not exists public.event_log (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_source text not null default 'web',
  path text not null,
  referrer text not null default '',
  user_agent text not null default '',
  ip_hash text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists event_log_created_at_idx
  on public.event_log (created_at desc);

create index if not exists event_log_event_name_created_at_idx
  on public.event_log (event_name, created_at desc);
