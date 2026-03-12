-- Test feedback table for collecting user testing feedback
create table public.test_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Who submitted it
  tester_email text,
  tester_name text,
  user_id uuid references auth.users(id) on delete set null,

  -- What page they were on
  page_url text not null,
  page_title text,

  -- Feedback content
  category text not null default 'general',  -- bug, confusion, suggestion, praise, general
  description text not null,
  severity text default 'medium',            -- low, medium, high, critical

  -- Screenshot annotation (base64 or URL)
  screenshot_data text,

  -- Device/browser info
  user_agent text,
  viewport_width int,
  viewport_height int,

  -- Status for review
  status text not null default 'new',        -- new, reviewed, in_progress, resolved, wont_fix
  admin_notes text
);

-- Index for admin review
create index idx_test_feedback_status on public.test_feedback(status, created_at desc);
create index idx_test_feedback_category on public.test_feedback(category);

-- RLS: anyone can insert feedback, only admins read
alter table public.test_feedback enable row level security;

create policy "Anyone can submit feedback"
  on public.test_feedback for insert
  with check (true);

create policy "Authenticated users can view their own feedback"
  on public.test_feedback for select
  using (user_id = auth.uid());
