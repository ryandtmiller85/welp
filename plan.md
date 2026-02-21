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
