-- CoffeeMind Admin Analytics v1
-- Run this entire file in Supabase SQL Editor after supabase/schema.sql.
-- Then replace OWNER_EMAIL@example.com at the bottom with your CoffeeMind account email.

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

revoke all on table public.app_admins from anon, authenticated;

drop function if exists public.is_coffeemind_admin();
create or replace function public.is_coffeemind_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.app_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_coffeemind_admin() from public;
grant execute on function public.is_coffeemind_admin() to authenticated;

drop function if exists public.coffeemind_admin_dashboard();
create or replace function public.coffeemind_admin_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  result jsonb;
begin
  if not public.is_coffeemind_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'total_users', (select count(*) from auth.users),
    'users_today', (
      select count(*) from auth.users
      where created_at >= date_trunc('day', now())
    ),
    'users_7d', (
      select count(*) from auth.users
      where created_at >= now() - interval '7 days'
    ),
    'users_30d', (
      select count(*) from auth.users
      where created_at >= now() - interval '30 days'
    ),
    'active_7d', (
      select count(*) from auth.users
      where last_sign_in_at >= now() - interval '7 days'
    ),
    'total_tastings', (select count(*) from public.tastings),
    'total_books', (select count(*) from public.book_ratings),
    'avg_tastings_per_user', (
      select case
        when (select count(*) from auth.users) = 0 then 0
        else round(
          (select count(*)::numeric from public.tastings) /
          (select count(*)::numeric from auth.users),
          1
        )
      end
    ),
    'registration_series', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', to_char(days.day, 'YYYY-MM-DD'),
        'registrations', coalesce(registrations.count, 0)
      ) order by days.day), '[]'::jsonb)
      from generate_series(
        date_trunc('day', now()) - interval '13 days',
        date_trunc('day', now()),
        interval '1 day'
      ) as days(day)
      left join (
        select date_trunc('day', created_at) as day, count(*)
        from auth.users
        where created_at >= date_trunc('day', now()) - interval '13 days'
        group by 1
      ) registrations on registrations.day = days.day
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.coffeemind_admin_dashboard() from public;
grant execute on function public.coffeemind_admin_dashboard() to authenticated;

drop function if exists public.coffeemind_admin_recent_users(integer);
create or replace function public.coffeemind_admin_recent_users(p_limit integer default 12)
returns table (
  id uuid,
  email text,
  name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  tasting_count bigint,
  book_count bigint
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_coffeemind_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  return query
  select
    users.id,
    users.email::text,
    profiles.name,
    users.created_at,
    users.last_sign_in_at,
    (select count(*) from public.tastings where tastings.user_id = users.id) as tasting_count,
    (select count(*) from public.book_ratings where book_ratings.user_id = users.id) as book_count
  from auth.users users
  left join public.profiles profiles on profiles.id = users.id
  order by users.created_at desc
  limit greatest(1, least(coalesce(p_limit, 12), 50));
end;
$$;

revoke all on function public.coffeemind_admin_recent_users(integer) from public;
grant execute on function public.coffeemind_admin_recent_users(integer) to authenticated;

-- IMPORTANT: replace the email below with the email of your registered CoffeeMind owner account.
insert into public.app_admins (user_id)
select id from auth.users where lower(email) = lower('OWNER_EMAIL@example.com')
on conflict (user_id) do nothing;
