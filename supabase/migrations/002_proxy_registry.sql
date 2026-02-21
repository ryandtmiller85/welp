-- Migration 002: Proxy Registry Support
-- Adds ability for advocates to create registries on behalf of others

-- Add proxy registry fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS recipient_name text,
  ADD COLUMN IF NOT EXISTS recipient_email text,
  ADD COLUMN IF NOT EXISTS relationship text,
  ADD COLUMN IF NOT EXISTS is_proxy boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS claimed_by_user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

-- Index for advocate lookups
CREATE INDEX IF NOT EXISTS idx_profiles_created_by ON public.profiles(created_by_user_id);

-- RLS: Advocates can view proxy profiles they created
CREATE POLICY "Advocates can view proxy profiles they created"
  ON public.profiles FOR SELECT
  USING (created_by_user_id = auth.uid());

-- RLS: Advocates can update proxy profiles they created (until claimed)
CREATE POLICY "Advocates can update unclaimed proxy profiles"
  ON public.profiles FOR UPDATE
  USING (created_by_user_id = auth.uid() AND claimed_by_user_id IS NULL);

-- RLS: Advocates can insert proxy profiles
CREATE POLICY "Advocates can create proxy profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (created_by_user_id = auth.uid());

-- RLS: Advocates can manage items for unclaimed proxy registries
CREATE POLICY "Advocates can manage proxy registry items"
  ON public.registry_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = registry_items.user_id
      AND profiles.created_by_user_id = auth.uid()
      AND profiles.claimed_by_user_id IS NULL
    )
  );

-- RLS: Same for cash funds
CREATE POLICY "Advocates can manage proxy cash funds"
  ON public.cash_funds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = cash_funds.user_id
      AND profiles.created_by_user_id = auth.uid()
      AND profiles.claimed_by_user_id IS NULL
    )
  );
