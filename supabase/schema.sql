-- CoffeeMind AI — Supabase schema v1
-- Run the whole file in Supabase SQL Editor for a new project.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'CoffeeMind User',
  avatar_color text default '#D9A35F',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tastings (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  coffee_name text not null,
  country text default '',
  region text default '',
  farm text default '',
  variety text default '',
  processing text default '',
  roaster text default '',
  roast_date text default '',
  brew_method text default '',
  dose_grams text default '',
  beverage_weight_grams text default '',
  brew_time_seconds text default '',
  water_temperature_celsius text default '',
  dry_aroma text default '',
  wet_aroma text default '',
  first_impression text default '',
  acidity int default 5,
  sweetness int default 5,
  bitterness int default 5,
  body int default 5,
  balance int default 5,
  clean_cup int default 5,
  aftertaste int default 5,
  top_three_descriptors text[] not null default '{}',
  additional_descriptors text[] not null default '{}',
  notes text default '',
  overall_score int default 0,
  favorite boolean not null default false,
  photo_url text default '',
  photos jsonb not null default '[]'::jsonb
);

create table if not exists public.book_ratings (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  author text default '',
  status text check (status in ('want', 'reading', 'finished')) default 'finished',
  rating int check (rating between 1 and 10),
  mood text default '',
  quote text default '',
  notes text default '',
  paired_coffee_id text references public.tastings(id) on delete set null,
  paired_coffee_name text default '',
  favorite boolean not null default false
);

create index if not exists tastings_user_created_idx on public.tastings(user_id, created_at desc);
create index if not exists books_user_created_idx on public.book_ratings(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.tastings enable row level security;
alter table public.book_ratings enable row level security;

drop policy if exists "profiles select own" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "profiles delete own" on public.profiles;
create policy "profiles select own" on public.profiles for select using ((select auth.uid()) = id);
create policy "profiles insert own" on public.profiles for insert with check ((select auth.uid()) = id);
create policy "profiles update own" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles delete own" on public.profiles for delete using ((select auth.uid()) = id);

drop policy if exists "tastings select own" on public.tastings;
drop policy if exists "tastings insert own" on public.tastings;
drop policy if exists "tastings update own" on public.tastings;
drop policy if exists "tastings delete own" on public.tastings;
create policy "tastings select own" on public.tastings for select using ((select auth.uid()) = user_id);
create policy "tastings insert own" on public.tastings for insert with check ((select auth.uid()) = user_id);
create policy "tastings update own" on public.tastings for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tastings delete own" on public.tastings for delete using ((select auth.uid()) = user_id);

drop policy if exists "books select own" on public.book_ratings;
drop policy if exists "books insert own" on public.book_ratings;
drop policy if exists "books update own" on public.book_ratings;
drop policy if exists "books delete own" on public.book_ratings;
create policy "books select own" on public.book_ratings for select using ((select auth.uid()) = user_id);
create policy "books insert own" on public.book_ratings for insert with check ((select auth.uid()) = user_id);
create policy "books update own" on public.book_ratings for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "books delete own" on public.book_ratings for delete using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'CoffeeMind User'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
