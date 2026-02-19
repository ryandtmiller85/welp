-- Welp: Initial Database Schema
-- Run this in Supabase SQL Editor to set up your database

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

create type event_type as enum (
  'breakup',
  'divorce',
  'canceled_wedding',
  'fresh_start',
  'job_loss',
  'medical',
  'housing',
  'other'
);

create type privacy_level as enum (
  'public',
  'link_only',
  'private'
);

create type item_priority as enum (
  'need',
  'want',
  'dream'
);

create type item_status as enum (
  'available',
  'claimed',
  'partially_funded',
  'fulfilled'
);

create type item_category as enum (
  'the_basics',
  'kitchen_reset',
  'bedroom_glowup',
  'living_solo',
  'self_care',
  'wheels',
  'petty_fund',
  'fresh_start_fund',
  'treat_yoself',
  'pets',
  'tech',
  'other'
);

create type fund_type as enum (
  'moving',
  'deposit',
  'legal',
  'therapy',
  'pet',
  'travel',
  'petty',
  'custom'
);

create type contribution_status as enum (
  'pending',
  'completed',
  'failed',
  'refunded'
);

-- ============================================
-- TABLES
-- ============================================

-- User profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  alias text, -- e.g. "Recently Unjilted in Denver"
  profile_photo_url text,
  cover_photo_url text,
  story_text text,
  event_type event_type default 'breakup',
  event_date date,
  city text,
  state text,
  privacy_level privacy_level default 'link_only',
  slug text unique,
  show_days_counter boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Registry items (products from external retailers)
create table public.registry_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  source_url text, -- original product link
  affiliate_url text,
  retailer text,
  price_cents integer,
  category item_category default 'other',
  priority item_priority default 'want',
  custom_note text, -- "I literally do not own a can opener"
  is_group_gift boolean default false,
  group_gift_target_cents integer,
  group_gift_funded_cents integer default 0,
  status item_status default 'available',
  claimed_by_name text,
  claimed_at timestamptz,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cash funds
create table public.cash_funds (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  goal_cents integer not null,
  raised_cents integer default 0,
  fund_type fund_type default 'custom',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contributions (cash fund payments + group gift contributions)
create table public.contributions (
  id uuid primary key default uuid_generate_v4(),
  cash_fund_id uuid references public.cash_funds(id) on delete set null,
  registry_item_id uuid references public.registry_items(id) on delete set null,
  contributor_name text not null,
  contributor_email text,
  amount_cents integer not null,
  is_anonymous boolean default false,
  message text,
  stripe_payment_id text,
  status contribution_status default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Encouragement wall (notes of support)
create table public.encouragements (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  message text not null,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_profiles_slug on public.profiles(slug);
create index idx_profiles_privacy on public.profiles(privacy_level);
create index idx_registry_items_user on public.registry_items(user_id);
create index idx_registry_items_status on public.registry_items(status);
create index idx_cash_funds_user on public.cash_funds(user_id);
create index idx_contributions_fund on public.contributions(cash_fund_id);
create index idx_contributions_item on public.contributions(registry_item_id);
create index idx_encouragements_profile on public.encouragements(profile_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.registry_items enable row level security;
alter table public.cash_funds enable row level security;
alter table public.contributions enable row level security;
alter table public.encouragements enable row level security;

-- Profiles: anyone can read public/link_only profiles, owners can do everything
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (privacy_level in ('public', 'link_only'));

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Registry items: public read for visible profiles, owner CRUD
create policy "Registry items are viewable for visible profiles"
  on public.registry_items for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = registry_items.user_id
      and profiles.privacy_level in ('public', 'link_only')
    )
  );

create policy "Users can view their own items"
  on public.registry_items for select
  using (auth.uid() = user_id);

create policy "Users can manage their own items"
  on public.registry_items for all
  using (auth.uid() = user_id);

-- Cash funds: same pattern
create policy "Cash funds are viewable for visible profiles"
  on public.cash_funds for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = cash_funds.user_id
      and profiles.privacy_level in ('public', 'link_only')
    )
  );

create policy "Users can manage their own funds"
  on public.cash_funds for all
  using (auth.uid() = user_id);

-- Contributions: anyone can insert, only profile owner and contributor can view
create policy "Anyone can create contributions"
  on public.contributions for insert
  with check (true);

create policy "Profile owners can view contributions to their items/funds"
  on public.contributions for select
  using (
    exists (
      select 1 from public.cash_funds
      where cash_funds.id = contributions.cash_fund_id
      and cash_funds.user_id = auth.uid()
    )
    or
    exists (
      select 1 from public.registry_items
      where registry_items.id = contributions.registry_item_id
      and registry_items.user_id = auth.uid()
    )
  );

-- Encouragements: anyone can read public ones, anyone can insert
create policy "Public encouragements are viewable"
  on public.encouragements for select
  using (is_public = true);

create policy "Anyone can leave encouragement"
  on public.encouragements for insert
  with check (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_registry_items_updated_at
  before update on public.registry_items
  for each row execute function public.handle_updated_at();

create trigger set_cash_funds_updated_at
  before update on public.cash_funds
  for each row execute function public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, slug)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    lower(replace(new.id::text, '-', ''))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
