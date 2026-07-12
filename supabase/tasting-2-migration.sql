-- CoffeeMind Tasting 2.0 — safe additive migration
-- Run once in Supabase SQL Editor before deploying the new frontend.

alter table public.tastings add column if not exists producer text default '';
alter table public.tastings add column if not exists washing_station text default '';
alter table public.tastings add column if not exists elevation_meters text default '';
alter table public.tastings add column if not exists harvest_year text default '';
alter table public.tastings add column if not exists lot_number text default '';

alter table public.tastings add column if not exists grinder_model text default '';
alter table public.tastings add column if not exists grind_setting text default '';
alter table public.tastings add column if not exists water_name text default '';
alter table public.tastings add column if not exists water_tds_ppm text default '';
alter table public.tastings add column if not exists bloom_seconds text default '';

alter table public.tastings add column if not exists aroma_score int default 5;
alter table public.tastings add column if not exists flavor_score int default 5;

comment on column public.tastings.elevation_meters is 'Free-form elevation value for backward-compatible mobile input';
comment on column public.tastings.water_tds_ppm is 'Free-form TDS value in ppm';
