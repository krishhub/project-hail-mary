-- ReelVault schema
-- Run this in your Supabase SQL editor

create extension if not exists "pgcrypto";

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz default now(),
  constraint categories_name_unique unique (name)
);

-- Seed a few default categories
insert into categories (name, color) values
  ('Funny', '#f59e0b'),
  ('Tech', '#3b82f6'),
  ('Cooking', '#22c55e'),
  ('Fitness', '#ef4444'),
  ('Travel', '#8b5cf6'),
  ('Inspiration', '#ec4899')
on conflict (name) do nothing;

-- Reels
create table if not exists reels (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  platform text not null check (platform in ('youtube', 'instagram', 'other')),
  title text,
  thumbnail text,
  author text,
  duration text,
  category_id uuid references categories(id) on delete set null,
  notes text,
  is_watched boolean not null default false,
  is_favorite boolean not null default false,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Index for filtering
create index if not exists reels_category_id_idx on reels (category_id);
create index if not exists reels_platform_idx on reels (platform);
create index if not exists reels_is_watched_idx on reels (is_watched);
create index if not exists reels_received_at_idx on reels (received_at desc);

-- Enable Row Level Security (open for now — add auth later if needed)
alter table categories enable row level security;
alter table reels enable row level security;

create policy "Allow all on categories" on categories for all using (true) with check (true);
create policy "Allow all on reels" on reels for all using (true) with check (true);
