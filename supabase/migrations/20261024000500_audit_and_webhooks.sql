-- Phase 1 · 0005
-- Audit trail and webhook idempotency.
-- Safe to re-run: create table/index if not exists.

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  changes jsonb not null default '{}'::jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_length check (char_length(action) between 2 and 80),
  constraint audit_logs_entity_type_length check (
    char_length(entity_type) between 2 and 80
  ),
  constraint audit_logs_changes_object check (jsonb_typeof(changes) = 'object')
);

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);
create index if not exists audit_logs_actor_idx
  on public.audit_logs (actor_id, created_at desc);
create index if not exists audit_logs_entity_idx
  on public.audit_logs (entity_type, entity_id, created_at desc);

create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  status text not null default 'received',
  error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint stripe_events_status_check
    check (status in ('received', 'processed', 'failed'))
);

create index if not exists stripe_events_status_idx
  on public.stripe_events (status, created_at);
