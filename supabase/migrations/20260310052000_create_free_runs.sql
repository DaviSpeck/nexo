-- Anonymous/free converter run metadata.
-- Stores operational signals without storing markdown content or image binaries.

create extension if not exists pgcrypto;

create table if not exists public.free_runs (
  id uuid primary key default gen_random_uuid(),
  event_source text not null default 'free_converter',
  path text not null,
  referrer text not null default '',
  user_agent text not null default '',
  ip_hash text not null default '',
  source_name text not null default 'documento',
  markdown_chars integer not null default 0,
  attachments_count integer not null default 0,
  attachments_total_bytes bigint not null default 0,
  request_bytes bigint not null default 0,
  status text not null,
  error_code text not null default '',
  duration_ms integer not null default 0,
  created_at timestamptz not null default now(),
  constraint free_runs_status_check check (status in ('success', 'validation_error', 'failed'))
);

create index if not exists free_runs_created_at_idx
  on public.free_runs (created_at desc);

create index if not exists free_runs_status_created_at_idx
  on public.free_runs (status, created_at desc);
