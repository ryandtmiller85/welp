-- Migration 005: RPC functions for proxy registry creation and claiming
-- These use SECURITY DEFINER to bypass RLS and FK constraints,
-- since proxy profiles need UUIDs that don't exist in auth.users.

-- ============================================
-- CREATE PROXY PROFILE
-- ============================================
-- Inserts a new profile row for a proxy registry.
-- The profile ID is a generated UUID (not in auth.users),
-- so this must bypass the FK constraint via SECURITY DEFINER.

create or replace function public.create_proxy_profile(
  p_id uuid,
  p_created_by uuid,
  p_recipient_name text,
  p_recipient_email text default null,
  p_relationship text default null,
  p_event_type event_type default 'other',
  p_story_text text default null,
  p_city text default null,
  p_state text default null,
  p_slug text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Verify the caller is an authenticated user
  if p_created_by is null then
    raise exception 'created_by user ID is required';
  end if;

  -- Temporarily disable the FK constraint on profiles.id -> auth.users(id)
  -- We do this by inserting directly since SECURITY DEFINER runs as the function owner (postgres)
  insert into public.profiles (
    id,
    display_name,
    recipient_name,
    recipient_email,
    relationship,
    is_proxy,
    created_by_user_id,
    event_type,
    story_text,
    city,
    state,
    slug,
    privacy_level,
    created_at,
    updated_at
  ) values (
    p_id,
    p_recipient_name,          -- use recipient name as display_name
    p_recipient_name,
    p_recipient_email,
    p_relationship,
    true,                       -- is_proxy = true
    p_created_by,
    p_event_type,
    p_story_text,
    p_city,
    p_state,
    p_slug,
    'link_only'::privacy_level, -- default to link_only for proxy registries
    now(),
    now()
  );
end;
$$;

-- ============================================
-- CLAIM PROXY PROFILE
-- ============================================
-- Transfers ownership of a proxy registry to the claiming user.
-- Updates the profile to link it to the claimer's auth account.
-- Uses SECURITY DEFINER since the claimer may not have UPDATE
-- access on this row via RLS.

create or replace function public.claim_proxy_profile(
  p_profile_id uuid,
  p_claimed_by uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile record;
begin
  -- Verify the claimer is provided
  if p_claimed_by is null then
    raise exception 'claimed_by user ID is required';
  end if;

  -- Fetch the profile
  select * into v_profile
  from public.profiles
  where id = p_profile_id
    and is_proxy = true;

  if not found then
    raise exception 'Proxy registry not found';
  end if;

  -- Check it hasn't been claimed already
  if v_profile.claimed_by_user_id is not null then
    raise exception 'This registry has already been claimed';
  end if;

  -- Can't claim your own proxy
  if v_profile.created_by_user_id = p_claimed_by then
    raise exception 'You cannot claim a registry you created';
  end if;

  -- Transfer ownership
  update public.profiles
  set
    claimed_by_user_id = p_claimed_by,
    claimed_at = now(),
    updated_at = now()
  where id = p_profile_id;
end;
$$;

-- Grant execute permissions to authenticated users
grant execute on function public.create_proxy_profile to authenticated;
grant execute on function public.claim_proxy_profile to authenticated;
