# Welp — Agent Testing Guide

## Staging URL
`https://welp-git-staging-ryans-projects-1cff6bce.vercel.app`

## Agent Test Credentials

| Account | Email | Password | Purpose |
|---------|-------|----------|---------|
| Agent 1 | agent-tester-1@alliswelp.com | WelpTest2026! | Registry creation + item management |
| Agent 2 | agent-tester-2@alliswelp.com | WelpTest2026! | Fund creation + payouts |
| Agent 3 | agent-tester-3@alliswelp.com | WelpTest2026! | Proxy registry + encouragements |

## Test Scenarios

### Scenario 1: Registry Creation & Item Management (Agent 1)

1. **Log in** at `/auth/login` with Agent 1 credentials
2. **Verify dashboard loads** — should see welcome message, stats cards, share link
3. **Edit profile** — navigate to dashboard, click Edit Profile
   - Set display name to "Agent Test User"
   - Write a short story
   - Set privacy to "Public"
   - Save and verify changes persist
4. **Add items to registry:**
   - Add an item via URL scraper (try: `https://www.amazon.com/dp/B0CXKYTQS8`)
   - Add an item manually (title: "New Couch", price: $500, category: furniture, priority: need)
   - Add an item from the curated catalog
5. **Verify public registry page** — visit the registry slug URL, confirm items show
6. **Edit an item** — change price, priority, or category
7. **Delete an item** — remove one item, verify it's gone
8. **Log out** — hit Sign Out, verify redirect to homepage, verify "Log In" shows in header

### Scenario 2: Cash Fund Creation (Agent 2)

1. **Log in** with Agent 2 credentials
2. **Edit profile** — set display name, set privacy to "Public"
3. **Create a cash fund:**
   - Navigate to dashboard → New Fund
   - Title: "New Apartment Deposit"
   - Goal: $2,000
   - Description: "Help me get a fresh start in a new place"
4. **Verify fund appears** on dashboard and public registry page
5. **Test contribution modal (DO NOT COMPLETE PAYMENT):**
   - Visit the public registry page as a logged-out user (open incognito)
   - Click "Contribute" on the fund
   - Verify the modal opens with preset amounts ($5, $10, $25, $50, $100)
   - Fill in test details and click Contribute
   - Verify Stripe Checkout page loads (then go back — don't pay)
6. **Check payouts page** — navigate to `/dashboard/payouts`, verify setup flow shows

### Scenario 3: Proxy Registry & Encouragements (Agent 3)

1. **Log in** with Agent 3 credentials
2. **Create a proxy registry:**
   - Navigate to `/create-for`
   - Fill in: name "Sarah", relationship "Best Friend", event "Breakup"
   - Add 2-3 items
   - Submit
3. **Verify proxy registry appears** in dashboard under "Registries You're Managing"
4. **Test encouragement wall:**
   - Visit any public registry (including the proxy one)
   - Leave an encouragement message
   - Verify it appears on the wall
5. **Test browse page** — navigate to `/browse`, verify public registries are listed and searchable

### Scenario 4: Navigation & UX (Any Agent)

1. **Test all header links** — Browse, Shop, Merch, About, Dashboard (when logged in)
2. **Test footer links** — Terms, Privacy, Community Guidelines (verify no 404s)
3. **Test merch page** — navigate to `/merch`, browse items, click on one
4. **Test shop page** — navigate to `/shop`, browse categories
5. **Test error pages** — visit `/nonexistent-page`, verify 404 page shows
6. **Test mobile responsiveness** — resize browser to mobile width, verify layout adapts
7. **Test forgot password flow** — click "Forgot password?" on login page, verify form shows

### Things NOT to Test (Payment Restrictions)

- Do NOT complete any Stripe Checkout payments
- Do NOT complete Stripe Connect onboarding (requires real bank details)
- Do NOT purchase merch items (creates real Printify orders)

### Feedback Submission

After each scenario, use the floating pink feedback button (bottom-right) to report:
- Bugs found (with screenshots)
- Confusing UX
- Suggestions for improvement
- Things that worked well
