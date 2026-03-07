-- Merch orders table — records completed Stripe checkout sessions
CREATE TABLE IF NOT EXISTS public.merch_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text UNIQUE NOT NULL,
  stripe_payment_intent_id text,
  merch_item_id text NOT NULL,
  item_title text,
  amount_total integer,          -- in cents
  currency text DEFAULT 'usd',
  customer_email text,
  shipping_name text,
  shipping_address jsonb,
  status text NOT NULL DEFAULT 'paid',  -- paid, fulfilled, cancelled, refunded
  printify_order_id text,        -- filled when Printify order is created
  fulfilled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_merch_orders_created_at ON public.merch_orders(created_at);
CREATE INDEX idx_merch_orders_status ON public.merch_orders(status);
CREATE INDEX idx_merch_orders_merch_item_id ON public.merch_orders(merch_item_id);

-- RLS: only service role can insert/read (webhook processing)
ALTER TABLE public.merch_orders ENABLE ROW LEVEL SECURITY;

-- No public policies — only service role (via supabaseAdmin) can access
-- This keeps order data private and secure
