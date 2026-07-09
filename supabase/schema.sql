-- CoffeeMind AI cloud-ready schema for Supabase
-- Enable RLS after creating these tables.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text default 'CoffeeMind User',
  created_at timestamptz default now()
);

create table if not exists tastings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  coffee_name text not null,
  country text,
  region text,
  farm text,
  variety text,
  processing text,
  roaster text,
  roast_date text,
  brew_method text,
  dose_grams text,
  beverage_weight_grams text,
  brew_time_seconds text,
  water_temperature_celsius text,
  dry_aroma text,
  wet_aroma text,
  first_impression text,
  acidity int,
  sweetness int,
  bitterness int,
  body int,
  balance int,
  clean_cup int,
  aftertaste int,
  top_three_descriptors text[] default '{}',
  additional_descriptors text[] default '{}',
  notes text,
  overall_score int,
  favorite boolean default false,
  photo_url text
);

create table if not exists book_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  title text not null,
  author text,
  status text check (status in ('want', 'reading', 'finished')) default 'finished',
  rating int check (rating between 1 and 10),
  mood text,
  quote text,
  notes text,
  paired_coffee_id uuid references tastings(id) on delete set null,
  paired_coffee_name text,
  favorite boolean default false
);

alter table profiles enable row level security;
alter table tastings enable row level security;
alter table book_ratings enable row level security;

create policy "profiles belong to owner" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "tastings belong to owner" on tastings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "book ratings belong to owner" on book_ratings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
