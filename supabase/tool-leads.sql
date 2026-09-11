create table if not exists public.tool_leads (
  id uuid primary key default gen_random_uuid(),
  email text,
  tool_slug text not null,
  tool_title text not null,
  division text,
  result_key text,
  result_level text,
  answers jsonb not null default '{}'::jsonb,
  event_type text not null default 'assessment_email'
    check (event_type in ('assessment_email', 'project_start')),
  session_id text,
  source_url text,
  destination_url text,
  submitted_at timestamptz not null default now()
);

create index if not exists tool_leads_submitted_at_idx
  on public.tool_leads (submitted_at desc);

create index if not exists tool_leads_tool_slug_idx
  on public.tool_leads (tool_slug);

create index if not exists tool_leads_event_type_idx
  on public.tool_leads (event_type);

alter table public.tool_leads enable row level security;

comment on table public.tool_leads is
  'Assessment email captures and Start a Project intent events from PC Water decision tools.';
