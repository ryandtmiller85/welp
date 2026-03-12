-- ============================================================
-- TEST ACCOUNTS FOR USER TESTING
-- Run this in the Supabase SQL Editor
-- ============================================================
--
-- These accounts use Supabase's built-in auth.
-- Password for all test accounts: WelpTest2026!
--
-- After running this, each account can log in at the site.
-- The trigger on auth.users automatically creates a profile.
-- ============================================================

-- Agent tester accounts (for Cowork AI agents)
-- These will test core flows programmatically

-- Agent 1: Tests registry creation + item management
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  gen_random_uuid(),
  'agent-tester-1@alliswelp.com',
  crypt('WelpTest2026!', gen_salt('bf')),
  now(),
  '{"display_name": "Agent Tester 1"}'::jsonb,
  now(), now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
);

-- Agent 2: Tests fund creation + payouts setup
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  gen_random_uuid(),
  'agent-tester-2@alliswelp.com',
  crypt('WelpTest2026!', gen_salt('bf')),
  now(),
  '{"display_name": "Agent Tester 2"}'::jsonb,
  now(), now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
);

-- Agent 3: Tests proxy registry + encouragements
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  gen_random_uuid(),
  'agent-tester-3@alliswelp.com',
  crypt('WelpTest2026!', gen_salt('bf')),
  now(),
  '{"display_name": "Agent Tester 3"}'::jsonb,
  now(), now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
);

-- Human tester accounts

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  gen_random_uuid(),
  'tester-1@alliswelp.com',
  crypt('WelpTest2026!', gen_salt('bf')),
  now(),
  '{"display_name": "Tester 1"}'::jsonb,
  now(), now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
);

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  gen_random_uuid(),
  'tester-2@alliswelp.com',
  crypt('WelpTest2026!', gen_salt('bf')),
  now(),
  '{"display_name": "Tester 2"}'::jsonb,
  now(), now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
);

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  gen_random_uuid(),
  'tester-3@alliswelp.com',
  crypt('WelpTest2026!', gen_salt('bf')),
  now(),
  '{"display_name": "Tester 3"}'::jsonb,
  now(), now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
);

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  gen_random_uuid(),
  'tester-4@alliswelp.com',
  crypt('WelpTest2026!', gen_salt('bf')),
  now(),
  '{"display_name": "Tester 4"}'::jsonb,
  now(), now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
);

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  gen_random_uuid(),
  'tester-5@alliswelp.com',
  crypt('WelpTest2026!', gen_salt('bf')),
  now(),
  '{"display_name": "Tester 5"}'::jsonb,
  now(), now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
);

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  gen_random_uuid(),
  'tester-6@alliswelp.com',
  crypt('WelpTest2026!', gen_salt('bf')),
  now(),
  '{"display_name": "Tester 6"}'::jsonb,
  now(), now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
);

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  gen_random_uuid(),
  'tester-7@alliswelp.com',
  crypt('WelpTest2026!', gen_salt('bf')),
  now(),
  '{"display_name": "Tester 7"}'::jsonb,
  now(), now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
);
