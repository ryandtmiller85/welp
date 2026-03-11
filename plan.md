# Proxy Registry — "Create for Someone Else"

## The Concept

An advocate (mom, sister, best friend, coworker) creates and manages a registry on behalf of someone going through it. The recipient can later claim and take full ownership when they're ready.

---

## Data Model Changes

### New columns on `profiles` table:
```sql
created_by_user_id  uuid     -- the advocate's auth user ID (NULL for self-created)
recipient_name      text     -- the recipient's name (as entered by advocate)
recipient_email     text     -- optional, for notification/claim invitation
relationship        text     -- "mom", "sister", "best friend", "coworker", etc.
is_proxy            boolean  -- TRUE if created on behalf of someone else
claimed_by_user_id  uuid     -- set when recipient claims the registry (NULL until then)
claimed_at          timestamptz -- when the claim happened
```

### New TypeScript types:
- Add corresponding fields to `Profile` interface
- Add `ProxyRegistry` view type for the advocate's dashboard

### RLS Policy Updates:
- Advocates can SELECT/UPDATE/INSERT on profiles they created (`created_by_user_id = auth.uid()`)
- Advocates can manage registry_items and cash_funds for profiles they created
- When claimed, advocate retains read access but loses write access

---

## User Flows

### Flow 1: Advocate Creates Proxy Registry

**Entry point**: New "Create for Someone Else" button — two places:
1. Landing page hero: secondary CTA alongside "Start Your Registry"
2. Dashboard: for logged-in advocates who want to help someone

**Steps**:
1. Advocate signs up / logs in (standard auth)
2. Lands on `/create-for` — a dedicated multi-step form:
   - **Step 1 — Who is this for?**
     - Recipient's first name (required)
     - Your relationship ("I'm their..." dropdown: Mom, Dad, Sister, Brother, Best Friend, Coworker, Other)
     - Recipient's email (optional — "We'll send them a notification and a way to take over later")
   - **Step 2 — Their situation**
     - Event type (breakup, divorce, etc. — same dropdown as normal signup)
     - Brief story (optional — advocate writes what they know: "My daughter just went through a rough breakup and is starting over in a new apartment")
     - City/State (optional)
   - **Step 3 — Start the list**
     - Quick-add from curated shop categories (reuse existing shop flow)
     - Paste URLs manually
     - Skip for now option
   - **Step 4 — Review & Launch**
     - Preview of how the registry will look
     - Privacy defaults to `link_only`
     - Prominent banner: "Created with love by [Advocate Name]"
     - Launch button

3. Registry goes live → advocate gets shareable link
4. If recipient email was provided, send a notification email:
   > "Hey [Name], someone who loves you just did something amazing. [Advocate] created a Welp registry to help you get back on your feet. You can view it here — and when you're ready, you can take it over and make it yours."

### Flow 2: Advocate Manages Proxy Registry

**Dashboard changes** (`/dashboard`):
- New section: "Registries You're Managing" — card list of proxy registries
- Each card shows: recipient name, relationship badge, item count, share link, "Manage" button
- "Manage" goes to `/dashboard/proxy/[profileId]` — same dashboard UI but scoped to that registry
- Advocate can: add/remove items, edit story, create funds, share the link
- Advocate CANNOT: change the recipient's email, modify claim status

### Flow 3: Recipient Claims Registry

**Entry point**: Link in notification email or shared directly by advocate

**Steps**:
1. Recipient visits claim link (`/claim/[token]`)
2. Signs up for a Welp account (or logs in if they have one)
3. Sees a confirmation screen:
   > "[Advocate Name] created this registry for you. Want to take it over?"
   > Shows preview of the registry contents
4. Clicks "Claim My Registry"
5. System updates:
   - `profiles.claimed_by_user_id` → recipient's user_id
   - `profiles.id` stays the same (preserves all items, funds, encouragements)
   - Registry items/funds remain attached
   - Advocate loses edit access, retains view access
   - Slug can optionally be changed by new owner
6. Recipient now sees this registry on their own dashboard
7. Advocate's dashboard shows "Claimed by [Name]" status

### Flow 4: Public View

The public-facing `[slug]` page gets a subtle indicator:
- If proxy AND not yet claimed: "Created with love by [Advocate Name] ([Relationship])"
- If proxy AND claimed: no indicator (it's theirs now)
- This appears as a small badge/banner below the profile header

---

## Pages & Components to Build

### New Pages:
1. **`/create-for`** — Multi-step proxy creation wizard (client component)
2. **`/dashboard/proxy/[id]`** — Proxy registry management dashboard
3. **`/claim/[token]`** — Claim flow for recipients

### New API Routes:
1. **`POST /api/proxy-registry`** — Creates a new proxy profile + returns it
2. **`GET /api/proxy-registries`** — Returns all proxy registries for current advocate
3. **`POST /api/proxy-registry/[id]/claim`** — Handles the claim/transfer
4. **`POST /api/proxy-registry/[id]/notify`** — Sends notification email to recipient

### Modified Pages:
1. **Landing page** (`/page.tsx`) — Add "Create for Someone Else" CTA in hero
2. **Dashboard** (`/dashboard/page.tsx`) — Add "Registries You're Managing" section
3. **Header** — No changes needed (dashboard link covers it)

### New Components:
1. **`ProxyCreationWizard`** — Multi-step form with progress indicator
2. **`ProxyRegistryCard`** — Card for advocate's dashboard showing proxy registry summary
3. **`ProxyBanner`** — "Created with love by..." banner for public view
4. **`ClaimRegistryFlow`** — Claim confirmation UI

---

## Database Migration (002)

```sql
-- Add proxy registry fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN created_by_user_id uuid REFERENCES auth.users(id),
  ADD COLUMN recipient_name text,
  ADD COLUMN recipient_email text,
  ADD COLUMN relationship text,
  ADD COLUMN is_proxy boolean DEFAULT false,
  ADD COLUMN claimed_by_user_id uuid REFERENCES auth.users(id),
  ADD COLUMN claimed_at timestamptz;

-- Index for advocate lookups
CREATE INDEX idx_profiles_created_by ON public.profiles(created_by_user_id);

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
```

---

## Build Order

### Phase 1: Database + Types (foundation)
1. Create migration 002 — add columns, indexes, RLS policies
2. Run migration on Supabase
3. Update TypeScript `Profile` interface with new fields

### Phase 2: Proxy Creation Flow
4. Build `/create-for` page with multi-step wizard
5. Build `POST /api/proxy-registry` route
6. Add "Create for Someone Else" CTA to landing page hero
7. Test: advocate can create a proxy registry, it appears at its slug

### Phase 3: Advocate Management
8. Build `GET /api/proxy-registries` route
9. Build `ProxyRegistryCard` component
10. Add "Registries You're Managing" section to dashboard
11. Build `/dashboard/proxy/[id]` management page (reuse existing dashboard patterns)
12. Test: advocate can manage items/funds on proxy registries

### Phase 4: Public View Updates
13. Add `ProxyBanner` component to `[slug]` page
14. Test: public view shows "Created with love by..." for unclaimed proxies

### Phase 5: Claim Flow
15. Build `/claim/[token]` page
16. Build `POST /api/proxy-registry/[id]/claim` route
17. Build notification email (optional — can be manual initially)
18. Test: recipient can claim, ownership transfers, advocate loses edit access

### Phase 6: Deploy & Verify
19. Full build, commit, push, deploy
20. End-to-end test on production

---
---

# Admin Portal — `/admin`

## The Concept

A protected dashboard where you (Ryan) can see everything happening across Welp — users, registries, transactions, merch orders, affiliate clicks, errors, and system health. Designed for a single admin operator (you) during early growth, with room to add role-based access later if needed.

## Authentication

### Current State
- Bearer token auth via `ADMIN_SECRET` env var
- Used by `/api/admin/*` routes already

### Planned Upgrade
- **Login page** at `/admin/login` — simple password form that stores the admin secret in an httpOnly session cookie
- All `/admin/*` pages check for this cookie via middleware
- No database-backed admin users yet — just the single `ADMIN_SECRET`
- Future: add Supabase-backed admin roles if you bring on team members

---

## Pages & Layout

### Shell / Layout (`/admin/layout.tsx`)
- Dark sidebar nav with Welp logo + "Admin" badge
- Sidebar links: Dashboard, Users, Registries, Transactions, Merch, Shop/Affiliate, Errors, Settings
- Top bar: current admin indicator, quick search, logout
- Responsive: collapses to hamburger on mobile

### 1. Dashboard Overview (`/admin`)
The home screen — a snapshot of everything at a glance.

**Stat cards (top row):**
- Total users (with +N this week)
- Active registries (public + link_only)
- Total contributions ($ amount)
- Merch orders (pending / fulfilled)
- Affiliate clicks (this week)

**Activity feed (center):**
- Real-time-ish feed of recent events: new signups, new registries, contributions, merch orders, claims
- Each entry: timestamp, event type icon, description, link to detail
- Filterable by event type

**Charts (bottom row):**
- Signups over time (line chart, last 30 days)
- Contributions over time (bar chart, last 30 days)
- Top registries by contribution amount

### 2. Users (`/admin/users`)
**Table view:**
- Columns: name/alias, email, signup date, registry count, total raised, proxy registries created, last active
- Search by name or email
- Sort by any column
- Click row → user detail

**User detail (`/admin/users/[id]`):**
- Profile info (display name, alias, email, event type, signup date)
- Their registries (with links)
- Their contributions received
- Proxy registries they created
- Proxy registries they claimed
- Account actions: (future) suspend, delete, impersonate-view

### 3. Registries (`/admin/registries`)
**Table view:**
- Columns: owner name, slug, event type, privacy level, item count, fund count, total raised, is_proxy, created date
- Filters: event type, privacy level, proxy vs self-created, claimed/unclaimed
- Search by slug or owner name
- Click row → registry detail

**Registry detail (`/admin/registries/[id]`):**
- Full profile info
- All registry items (with status, retailer, price)
- All cash funds (with progress bars)
- All contributions received (with Stripe payment IDs)
- All encouragements/comments
- Proxy info (if applicable): who created it, claim status
- Click tracking stats for this registry
- Actions: (future) feature/unfeature, flag, edit privacy

### 4. Transactions (`/admin/transactions`)
**Two tabs:**

**Cash Fund Contributions:**
- Columns: date, contributor name, amount, fund title, registry owner, Stripe payment ID, status
- Filters: date range, status (succeeded/pending/failed), amount range
- Search by contributor name or Stripe ID
- Click → Stripe dashboard link

**Merch Orders:**
- Columns: date, customer email, item, amount, Stripe session ID, Printify order ID, fulfillment status
- Filters: date range, fulfillment status, product type
- Search by email or order ID
- Click → order detail with Printify tracking info

**Summary stats at top:**
- Total revenue (contributions + merch)
- This month vs last month
- Average contribution size
- Top contributing registries

### 5. Merch / Printify (`/admin/merch`)
Upgrade of the existing `/admin/printify` page.

**Products tab:**
- All Printify products with images, titles, prices, status (published/draft)
- Sales count per product
- Quick actions: view on Printify, unpublish

**Orders tab:**
- Recent merch orders with fulfillment status
- Link to Printify order detail

**Design management:**
- Current design upload tool (already built)
- Preview all uploaded designs

### 6. Shop / Affiliate (`/admin/shop`)
**Curated catalog overview:**
- All 40 products across 8 categories
- Image preview, title, price, retailer, broken link status
- Click tracking: total clicks per product, clicks this week
- Flag any products where the Amazon URL returns an error

**Affiliate performance:**
- Total affiliate clicks (from `click_events` table)
- Clicks by category
- Clicks by product (top performers)
- Clicks over time chart
- Source breakdown (which registry pages drive the most clicks)

### 7. System / Errors (`/admin/system`)
**Error log:**
- Recent server-side errors (pulled from Vercel logs API or a custom error table)
- Client-side error reports (if you add an error boundary reporter)
- Filterable by severity, route, date

**Health checks:**
- Supabase connection status
- Stripe webhook status (last received, any failures)
- Printify API status
- Build/deploy status (latest Vercel deployment)

**Environment:**
- Which env vars are configured (not their values — just present/missing)
- Current deploy URL and git commit

### 8. Settings (`/admin/settings`)
- Change admin secret
- Toggle maintenance mode (shows a "we're updating" page to visitors)
- Feature flags (e.g., enable/disable proxy registries, enable/disable merch)
- Manage curated shop categories

---

## Database Changes

### New table: `admin_activity_log`
```sql
CREATE TABLE public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,        -- 'signup', 'registry_created', 'contribution', 'merch_order', 'claim', 'error'
  event_data jsonb DEFAULT '{}',   -- flexible payload
  actor_id uuid,                   -- user who triggered the event (NULL for system events)
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_admin_activity_type ON public.admin_activity_log(event_type);
CREATE INDEX idx_admin_activity_created ON public.admin_activity_log(created_at DESC);

-- Only service role can write; admin reads via API route
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
```

### New table: `feature_flags`
```sql
CREATE TABLE public.feature_flags (
  key text PRIMARY KEY,
  enabled boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.feature_flags (key, enabled) VALUES
  ('proxy_registries', true),
  ('merch_store', true),
  ('curated_shop', true),
  ('maintenance_mode', false);
```

---

## New API Routes

All under `/api/admin/` — protected by bearer token auth (same pattern as existing Printify routes).

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/stats` | GET | Dashboard stat cards + chart data |
| `/api/admin/activity` | GET | Activity feed (paginated, filterable) |
| `/api/admin/users` | GET | User list (paginated, searchable, sortable) |
| `/api/admin/users/[id]` | GET | User detail with related data |
| `/api/admin/registries` | GET | Registry list (paginated, filterable) |
| `/api/admin/registries/[id]` | GET | Registry detail with items, funds, contributions |
| `/api/admin/transactions` | GET | Contributions + merch orders (paginated) |
| `/api/admin/clicks` | GET | Affiliate click analytics |
| `/api/admin/errors` | GET | Error log |
| `/api/admin/health` | GET | System health checks |
| `/api/admin/settings` | GET/PUT | Feature flags and config |

---

## Build Order

### Phase 1: Auth & Layout
1. Build `/admin/login` page with session cookie flow
2. Add admin middleware to protect all `/admin/*` routes
3. Build admin layout shell (sidebar, top bar)
4. Build `/admin` dashboard with placeholder stat cards

### Phase 2: Core Data Views
5. Build `/api/admin/stats` route (aggregate queries)
6. Build `/api/admin/users` + `/api/admin/users/[id]` routes
7. Build Users page with table + detail view
8. Build `/api/admin/registries` + `/api/admin/registries/[id]` routes
9. Build Registries page with table + detail view

### Phase 3: Transactions & Merch
10. Build `/api/admin/transactions` route
11. Build Transactions page with contributions + merch tabs
12. Migrate existing Printify admin into new layout
13. Add order tracking to merch section

### Phase 4: Analytics & Monitoring
14. Build `/api/admin/clicks` route
15. Build Shop/Affiliate analytics page
16. Create `admin_activity_log` table + write triggers
17. Build activity feed on dashboard
18. Build System/Errors page

### Phase 5: Settings & Polish
19. Build feature flags system
20. Build Settings page
21. Add charts (recharts) to dashboard and analytics pages
22. Mobile-responsive pass on all admin pages
