-- Supabase Auth owns email addresses, password hashes, and sessions.
-- This table stores only application profile information.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 100),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
create policy "Read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Edit own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create or replace function private.create_user_profile()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.create_user_profile() from public, anon, authenticated;
create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure private.create_user_profile();
-- Support accounts created before this migration.
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

-- Keep the dashboard-managed automatic-RLS event trigger, but do not expose it as an RPC.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
