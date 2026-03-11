-- 006: Add Stripe Connect fields to profiles for fund payouts
-- Registry owners connect their Stripe Express account to receive contributions

alter table public.profiles
  add column if not exists stripe_account_id text,
  add column if not exists stripe_onboarding_complete boolean not null default false;

-- Index for looking up profiles by stripe account (webhook lookups)
create index if not exists idx_profiles_stripe_account
  on public.profiles (stripe_account_id)
  where stripe_account_id is not null;

-- Comment for documentation
comment on column public.profiles.stripe_account_id is 'Stripe Connect Express account ID for receiving fund contributions';
comment on column public.profiles.stripe_onboarding_complete is 'Whether the user has completed Stripe Connect onboarding';
