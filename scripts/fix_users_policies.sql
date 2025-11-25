-- fix_users_policies_20251125_073819.sql
-- Purpose: eliminate recursive RLS on public.users by using a SECURITY DEFINER helper.
-- Date: 2025-11-25 07:38:19 UTC

-- === 0) Preconditions (safe to re-run) =======================================
-- Ensure the schema exists
create schema if not exists public;

-- Ensure RLS is enabled on public.users (no-op if already set)
alter table if exists public.users enable row level security;

-- === 1) Helper function (SECURITY DEFINER) ==================================
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = uid
      and u.role = 'admin'
  );
$$;

-- Lock down who can execute the helper
revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated, anon;

-- === 2) Replace recursive policies with helper-based ones ====================
-- Drop possibly-recursive policies if they exist
drop policy if exists "Admin can view all users" on public.users;
drop policy if exists "Admin can update all users" on public.users;

-- (Re)create admin policies using the helper
create policy "Admin can view all users"
on public.users
for select
to authenticated, anon
using (public.is_admin(auth.uid()));

create policy "Admin can update all users"
on public.users
for update
to authenticated
using (public.is_admin(auth.uid()));

-- === 3) Ensure self-access policies exist (non-recursive) ====================
create policy if not exists "Users can view their own data"
on public.users
for select
to authenticated
using (auth.uid() = id);

create policy if not exists "Users can update their own data"
on public.users
for update
to authenticated
using (auth.uid() = id);

-- === 4) (Optional) Insert a guard for service_role access ====================
-- NOTE: service_role bypasses RLS; no policy required. Kept here for clarity.

-- === 5) Verify grants (optional) =============================================
-- Ensure typical Supabase roles can read via PostgREST
grant usage on schema public to anon, authenticated;
grant select on public.users to anon, authenticated;
grant update (name, role, avatar_url, email) on public.users to authenticated;

-- You may want to restrict 'role' updates to admins only in application code
-- or split into a separate policy that only allows admins to set role.

-- === 6) Post-migration smoke tests (run manually) ============================
-- -- As an admin user (auth.uid() = admin user id):
-- select count(*) from public.users;
-- -- As a non-admin user:
-- select * from public.users where id = auth.uid();
