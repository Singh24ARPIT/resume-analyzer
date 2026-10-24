# Rolefit

Rolefit is a full-suite AI resume analyzer. It compares a resume against a job description and explains the result: six weighted scores, matched and missing requirements, ATS checks, grounded feedback, bullet rewrites, cover letters, and version comparison.

The scoring number is deterministic TypeScript. Gemini only writes the prose, so the same resume and job pair always produces the same score.

## Features

- **Explainable match reports** — overall score, six subscores, skill evidence, keyword coverage, ATS checks, strengths, gaps, section feedback, bullet rewrites, interview questions.
- **Resume library** — private PDF/DOCX uploads, text extraction, skill detection, word count, and reuse across analyses.
- **Job library** — paste a description or import a public posting URL, then reuse it for analyses, comparisons, and cover letters.
- **Version comparison** — score two to four resumes against the same job side by side and call out the best fit.
- **Cover letters** — grounded drafts in three tones, generated from a completed analysis, with copy and DOCX export.
- **History** — searchable, filterable analyses with local deletion and JSON export.
- **Settings** — profile editing, workspace data counts, browser-data clearing, cloud-data deletion, and scoring transparency.
- **Demo mode** — without Supabase credentials the app runs entirely in the browser with sample fixtures and local storage. Without a Gemini key, grounded local templates replace model prose.

## Stack

- Next.js 16 (App Router, React 19, TypeScript, Turbopack)
- Tailwind CSS 4 with a custom shadcn-style component set
- Supabase Auth, Postgres, row-level security, and a private Storage bucket
- Google Gemini REST API (`gemini-2.5-flash` + `gemini-embedding-001` by default)
- `unpdf` and `mammoth` for text extraction, `cheerio` for job-page import, `docx` for export
- Vitest for unit tests

## Quick start (demo mode)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose **Explore the demo workspace**. No environment variables are required. Demo analyses, resumes, jobs, and cover letters are stored in `localStorage` under `rolefit:*` keys; sample fixtures are read-only.

Demo uploads are parsed inside the request and never stored on a server.

## Full setup

### 1. Create a Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of [`supabase/migrations/20261024000000_init.sql`](supabase/migrations/20261024000000_init.sql), and run it.
3. The migration creates `profiles`, `resumes`, `job_descriptions`, `analyses`, `cover_letters`, and `comparisons`, enables RLS on each table, adds the profile trigger, and creates the private `resumes` Storage bucket with per-user folder policies.

### 2. Configure auth

In **Authentication → URL Configuration**:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

Email/password auth works with the default Supabase settings. If email confirmation is enabled, confirm the address before signing in.

### 3. Add environment variables

```bash
cp .env.example .env.local
```

Fill in the project URL and anon/publishable key from **Project Settings → API**. Never commit `.env.local`; it is ignored by Git.

### 4. Optional: enable Gemini

Add a key from [Google AI Studio](https://aistudio.google.com/app/apikey):

```env
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
```

Without a key, `MOCK_AI` behavior is automatic: feedback, cover letters, and comparison verdicts come from local templates, while scoring stays deterministic. Set `MOCK_AI=1` to force local prose even when a key exists.

Gemini calls happen only on the server. Resume contact details are redacted before any model request, and the API key is never exposed to the browser.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and run an analysis.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | For real accounts | Supabase project URL. Leave blank for demo mode. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For real accounts | Supabase anon or publishable key. |
| `NEXT_PUBLIC_APP_URL` | No | Origin used in auth confirmation links. Defaults to the request host. |
| `GEMINI_API_KEY` | No | Enables hosted prose generation and embeddings. |
| `GEMINI_MODEL` | No | Text model. Defaults to `gemini-2.5-flash`. |
| `GEMINI_EMBEDDING_MODEL` | No | Embedding model. Defaults to `gemini-embedding-001`. |
| `MOCK_AI` | No | `1` forces local prose and lexical semantic scoring. |

## Scripts

```bash
npm run dev        # develop
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test       # Vitest in watch mode
npm run test:run   # Vitest once, for CI
```

## How scoring works

| Signal | Weight | What it measures |
| --- | --- | --- |
| Must-have skills | 35 | Coverage of required skills, with alias normalization and evidence in the resume |
| Experience | 20 | Estimated years, seniority alignment, and target level |
| Semantic fit | 15 | Gemini embedding similarity, or lexical cosine without a key |
| Preferred skills | 10 | Nice-to-have coverage |
| ATS readiness | 10 | Text layer, sections, contact details, length, metrics, action verbs, keyword stuffing, file format |
| Impact and clarity | 10 | Quantified bullets, action-verb starts, bullet volume |

The overall score is the weighted sum, clamped to 0–100. Gemini feedback is instructed to respect that score and to never invent employers, dates, degrees, metrics, or skills.

## Analysis pipeline

1. Validate the upload (magic bytes, 5 MB cap) and extract text from PDF/DOCX.
2. Detect sections, estimate experience, measure bullets, and redact contact details.
3. Infer the job title, seniority, years required, must-have and nice-to-have skills, and responsibilities.
4. Run the deterministic scoring engine and ATS checks.
5. Compute semantic similarity with Gemini embeddings when configured; otherwise use lexical cosine.
6. Generate feedback with Gemini, falling back to a local template on error.
7. Persist the report and source records to Supabase, or return a `local-*` report in demo mode.

## Project structure

```text
src/
  app/
    (app)/              authenticated workspace pages
    (auth)/             login, signup, and auth actions
    api/                analyze, resumes, jobs, cover letters, compare, analyses
    auth/callback/      Supabase email confirmation handler
  components/           UI, report, library, settings, and marketing components
  lib/
    ai/                 Gemini client, prompts, schemas, mock prose
    analysis/           pipeline orchestration
    data/               Supabase and demo queries
    demo/               fixtures and browser storage helpers
    parsing/            resume extraction, sections, JD import and heuristics
    scoring/            taxonomy, semantic utilities, deterministic engine
    supabase/           SSR clients and session refresh
supabase/migrations/    initial SQL schema and storage policies
```

## Data and privacy

- Resume files are stored in the private `resumes` bucket at `<user_id>/<resume_id>.<ext>`.
- Every table has RLS policies scoped to `auth.uid() = user_id`; Storage policies check the first folder against `auth.uid()`.
- Emails, phone numbers, and links are redacted before text is sent to Gemini.
- Deleting a resume cascades its analyses and cover letters. Deleting a job description cascades analyses tied to it.
- **Settings → Delete all data** removes workspace rows and stored files but keeps the account.
- Demo mode never uploads files. **Settings → Clear browser data** removes local analyses, resumes, jobs, and letters.

## Testing and CI

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```

GitHub Actions runs the same checks on pushes and pull requests to `main` (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Deployment notes

This repository is source-only by design; the project is intended to run locally or on any Node host. If you deploy it:

- Set the environment variables in the host dashboard.
- Set `NEXT_PUBLIC_APP_URL` to the production origin and add `<origin>/auth/callback` to Supabase redirect URLs.
- Run the migration against the production Supabase project before the first request.
- The Gemini key must remain server-side; only `NEXT_PUBLIC_*` values are exposed.

## Known limits

- Scanned PDFs without a text layer are rejected rather than OCR'd.
- Job URL imports only read public pages; some job boards block automated readers. Paste the description instead.
- Heuristic skill extraction is curated rather than exhaustive; unknown requirements can be under-matched.
- Gemini falls back to local prose on rate limits, timeouts, or schema failures. The report labels the fallback.
