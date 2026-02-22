-- Click tracking for affiliate links and outbound product clicks
-- Used for commission reconciliation and analytics

CREATE TABLE IF NOT EXISTS public.click_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- What was clicked
  registry_item_id uuid REFERENCES public.registry_items(id) ON DELETE SET NULL,
  url text NOT NULL,
  retailer text,
  is_affiliate boolean DEFAULT false,
  -- Context
  profile_id uuid, -- whose registry the click came from (null if from catalog browsing)
  source text NOT NULL DEFAULT 'registry', -- 'registry' | 'catalog' | 'marketplace_search'
  -- Metadata
  ip_hash text, -- SHA-256 of IP for dedup, not the raw IP
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Index for analytics queries
CREATE INDEX idx_click_events_created_at ON public.click_events(created_at);
CREATE INDEX idx_click_events_retailer ON public.click_events(retailer);
CREATE INDEX idx_click_events_profile_id ON public.click_events(profile_id);

-- RLS: anyone can insert (public click tracking), only platform admin can read
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log clicks"
  ON public.click_events FOR INSERT
  WITH CHECK (true);

-- No SELECT policy for regular users — only accessible via Supabase dashboard or service role
-- This prevents users from seeing click data for other registries
