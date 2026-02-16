-- Run this in the Supabase SQL Editor to create the checkins table and RLS.

-- Table: checkins
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  thoughts text,
  emotions text[] default '{}',
  body_parts text[] default '{}',
  energy_level integer check (energy_level >= 0 and energy_level <= 100),
  behavior_meta jsonb default '{}'
);

-- Index for fast lookups by user and date
create index checkins_user_created_idx on public.checkins (user_id, created_at desc);

-- Enable Row Level Security
alter table public.checkins enable row level security;

-- Policy: users can only access their own checkins
create policy "Users can manage own checkins"
  on public.checkins
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
