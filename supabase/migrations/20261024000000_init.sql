-- Rolefit initial schema
-- Apply this in the Supabase SQL editor (or with `supabase db push`).
-- It creates the workspace tables, row-level security policies, and the
-- private `resumes` storage bucket used by the app.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Resumes
-- ---------------------------------------------------------------------------

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint not null default 0 check (file_size >= 0),
  word_count integer not null default 0 check (word_count >= 0),
  skills text[] not null default '{}',
  content_text text,
  metrics jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resumes_user_created_idx
  on public.resumes (user_id, created_at desc);

alter table public.resumes enable row level security;

drop policy if exists "Resumes are viewable by owner" on public.resumes;
create policy "Resumes are viewable by owner"
  on public.resumes for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Resumes are insertable by owner" on public.resumes;
create policy "Resumes are insertable by owner"
  on public.resumes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Resumes are editable by owner" on public.resumes;
create policy "Resumes are editable by owner"
  on public.resumes for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Resumes are deletable by owner" on public.resumes;
create policy "Resumes are deletable by owner"
  on public.resumes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop trigger if exists resumes_set_updated_at on public.resumes;
create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Job descriptions
-- ---------------------------------------------------------------------------

create table if not exists public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  company text,
  source_url text,
  raw_text text not null,
  must_have_skills text[] not null default '{}',
  parsed jsonb,
  created_at timestamptz not null default now()
);

create index if not exists job_descriptions_user_created_idx
  on public.job_descriptions (user_id, created_at desc);

alter table public.job_descriptions enable row level security;

drop policy if exists "Jobs are viewable by owner" on public.job_descriptions;
create policy "Jobs are viewable by owner"
  on public.job_descriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Jobs are insertable by owner" on public.job_descriptions;
create policy "Jobs are insertable by owner"
  on public.job_descriptions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Jobs are editable by owner" on public.job_descriptions;
create policy "Jobs are editable by owner"
  on public.job_descriptions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Jobs are deletable by owner" on public.job_descriptions;
create policy "Jobs are deletable by owner"
  on public.job_descriptions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Analyses
-- ---------------------------------------------------------------------------

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  resume_id uuid references public.resumes (id) on delete cascade,
  job_id uuid references public.job_descriptions (id) on delete cascade,
  overall_score integer not null check (overall_score between 0 and 100),
  scores jsonb not null default '{}'::jsonb,
  model text,
  ai_fallback boolean not null default false,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists analyses_user_created_idx
  on public.analyses (user_id, created_at desc);
create index if not exists analyses_resume_idx on public.analyses (resume_id);
create index if not exists analyses_job_idx on public.analyses (job_id);

alter table public.analyses enable row level security;

drop policy if exists "Analyses are viewable by owner" on public.analyses;
create policy "Analyses are viewable by owner"
  on public.analyses for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Analyses are insertable by owner" on public.analyses;
create policy "Analyses are insertable by owner"
  on public.analyses for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Analyses are deletable by owner" on public.analyses;
create policy "Analyses are deletable by owner"
  on public.analyses for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Cover letters
-- ---------------------------------------------------------------------------

create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  analysis_id uuid not null references public.analyses (id) on delete cascade,
  tone text not null check (tone in ('professional', 'enthusiastic', 'concise')),
  title text not null,
  body text not null,
  model text,
  ai_fallback boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists cover_letters_user_created_idx
  on public.cover_letters (user_id, created_at desc);
create index if not exists cover_letters_analysis_idx
  on public.cover_letters (analysis_id);

alter table public.cover_letters enable row level security;

drop policy if exists "Cover letters are viewable by owner" on public.cover_letters;
create policy "Cover letters are viewable by owner"
  on public.cover_letters for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Cover letters are insertable by owner" on public.cover_letters;
create policy "Cover letters are insertable by owner"
  on public.cover_letters for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Cover letters are editable by owner" on public.cover_letters;
create policy "Cover letters are editable by owner"
  on public.cover_letters for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Cover letters are deletable by owner" on public.cover_letters;
create policy "Cover letters are deletable by owner"
  on public.cover_letters for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Comparisons
-- ---------------------------------------------------------------------------

create table if not exists public.comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_title text not null,
  company text,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists comparisons_user_created_idx
  on public.comparisons (user_id, created_at desc);

alter table public.comparisons enable row level security;

drop policy if exists "Comparisons are viewable by owner" on public.comparisons;
create policy "Comparisons are viewable by owner"
  on public.comparisons for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Comparisons are insertable by owner" on public.comparisons;
create policy "Comparisons are insertable by owner"
  on public.comparisons for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Comparisons are deletable by owner" on public.comparisons;
create policy "Comparisons are deletable by owner"
  on public.comparisons for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Private resume storage
-- ---------------------------------------------------------------------------
-- Each object is stored at `<user_id>/<resume_id>.<ext>`. The folder name is
-- checked against auth.uid() so one user can never read another user's file.

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update set public = false;

drop policy if exists "Resume files are viewable by owner" on storage.objects;
create policy "Resume files are viewable by owner"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Resume files are uploadable by owner" on storage.objects;
create policy "Resume files are uploadable by owner"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Resume files are editable by owner" on storage.objects;
create policy "Resume files are editable by owner"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Resume files are deletable by owner" on storage.objects;
create policy "Resume files are deletable by owner"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
