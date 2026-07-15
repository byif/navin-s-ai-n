create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text check (role in ('job_seeker', 'recruiter', 'admin')) default 'job_seeker',
  avatar_url text,
  company_name text,
  designation text,
  company_website text,
  industry text,
  primary_resume_name text,
  primary_resume_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  website text,
  industry text,
  created_at timestamptz default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  company_name text,
  title text not null,
  description text,
  required_skills text[] default '{}',
  experience_required text,
  location text,
  employment_type text,
  salary_range text,
  openings integer default 1,
  deadline text,
  status text check (status in ('Active', 'Closed')) default 'Active',
  views integer default 0,
  applications_count integer default 0,
  shortlisted_count integer default 0,
  interview_count integer default 0,
  selected_count integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  candidate_id uuid references public.profiles(id) on delete set null,
  candidate_name text,
  candidate_email text,
  resume_id text,
  resume_name text,
  ats_score integer default 0,
  resume_score integer default 0,
  status text default 'Applied',
  company_name text,
  job_title text,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  role text check (role in ('job_seeker', 'recruiter')) not null,
  title text not null,
  message text not null,
  type text default 'system',
  read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade,
  candidate_name text,
  recruiter_email text,
  interview_date text,
  interview_time text,
  interview_type text default 'AI Interview',
  status text default 'Waiting',
  join_time text,
  exit_time text,
  duration text,
  score integer,
  created_at timestamptz default now()
);

create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, job_id)
);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.notifications enable row level security;
alter table public.interviews enable row level security;
alter table public.saved_jobs enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles upsert own" on public.profiles;
create policy "profiles upsert own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "companies read" on public.companies;
create policy "companies read" on public.companies for select using (true);
drop policy if exists "companies write authenticated" on public.companies;
create policy "companies write authenticated" on public.companies for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "jobs read active" on public.jobs;
create policy "jobs read active" on public.jobs for select using (true);
drop policy if exists "jobs write authenticated" on public.jobs;
create policy "jobs write authenticated" on public.jobs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "applications authenticated" on public.applications;
create policy "applications authenticated" on public.applications for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "notifications authenticated" on public.notifications;
create policy "notifications authenticated" on public.notifications for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "interviews authenticated" on public.interviews;
create policy "interviews authenticated" on public.interviews for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "saved jobs authenticated" on public.saved_jobs;
create policy "saved jobs authenticated" on public.saved_jobs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;
