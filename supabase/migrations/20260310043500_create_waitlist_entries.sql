-- Waitlist entries for early access form
-- Safe to run multiple times.

create extension if not exists pgcrypto;

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  role text not null,
  use_case text not null default '',
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_entries_email_idx
  on public.waitlist_entries (lower(email));

create index if not exists waitlist_entries_created_at_idx
  on public.waitlist_entries (created_at desc);
