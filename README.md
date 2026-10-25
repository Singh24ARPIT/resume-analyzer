# Resume Analyzer

Resume Analyzer compares a resume against a job description and explains the result: six weighted scores, matched and missing requirements, ATS checks, grounded feedback, and bullet rewrites.

It is intentionally stateless. There is no account, no database, and no stored file. The resume is parsed in memory for a single request, the report is returned to the browser tab, and nothing survives a refresh. Print the report or export it as JSON if you want a copy.

The score is deterministic TypeScript. Gemini only writes the prose, and the app still works without a key.

## Features

- **Explainable match reports** — overall score, six subscores, skill evidence, keyword coverage, ATS checks, strengths, gaps, section feedback, bullet rewrites, and interview questions.
- **PDF and DOCX parsing** — text extraction, section detection, word count, and skill matching, all in the request.
- **Job import** — paste a description or import a public posting URL.
- **No persistence** — no database, no upload history, no browser storage. The report lives only in the open tab.
- **Works offline from AI** — without `GEMINI_API_KEY`, local feedback templates and lexical semantic scoring take over.

## Stack

- Next.js 16 (App Router, React 19, TypeScript, Turbopack)
- Tailwind CSS 4 with a custom shadcn-style component set
- Google Gemini REST API (`gemini-2.5-flash` + `gemini-embedding-001` by default), optional
- `unpdf` and `mammoth` for text extraction, `cheerio` for job-page import
- Vitest for unit tests

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), upload a resume, paste a job description, and run the analysis. No environment variables are required.

The resume file is read inside the server request and never written to disk. The response contains the full report; the browser keeps it in component state only.

## Optional: enable Gemini

Add a key from [Google AI Studio](https://aistudio.google.com/app/apikey):

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
```

Without a key, feedback comes from local templates, semantic similarity uses lexical cosine, and the report is labelled with the local model. Set `MOCK_AI=1` to force local prose even when a key exists.

Gemini calls happen only on the server. Resume contact details are redacted before any model request, and the API key is never exposed to the browser.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | No | Origin used for metadata. Defaults to `http://localhost:3000`. |
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

1. Validate the upload (magic bytes, 5 MB cap) and extract text from PDF/DOCX in memory.
2. Detect sections, estimate experience, measure bullets, and redact contact details.
3. Infer the job title, seniority, years required, must-have and nice-to-have skills, and responsibilities.
4. Run the deterministic scoring engine and ATS checks.
5. Compute semantic similarity with Gemini embeddings when configured; otherwise use lexical cosine.
6. Generate feedback with Gemini, falling back to a local template on error.
7. Return the report as JSON. Nothing is written to a database, disk, or browser storage.

## Project structure

```text
src/
  app/
    analyze/            the analyzer page
    sample/             static sample report
    api/analyze/        stateless parse + score endpoint
    api/jobs/import/    public job-page importer
  components/
    analyze/            upload and job form, report state
    report/             report renderer, print and JSON export
    marketing/          landing page navigation and footer
  lib/
    ai/                 Gemini client, prompts, schemas, local prose
    analysis/           pipeline orchestration
    parsing/            resume extraction, sections, JD import and heuristics
    scoring/            taxonomy, semantic utilities, deterministic engine
```

## Data and privacy

- The uploaded file is held in memory for one request and discarded when the response is sent.
- No database, no object storage, no cookies, and no `localStorage` for candidate data.
- The report exists only in the open browser tab. Refreshing or closing it deletes the report.
- Emails, phone numbers, and links are redacted before text is sent to Gemini.
- The Gemini key stays server-side; it is never bundled into the client.
- Without a key, no resume text leaves the server at all.

## Testing and CI

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```

GitHub Actions runs the same checks on pushes and pull requests to `main` (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Deploy on Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Singh24ARPIT/resume-analyzer)

The repo includes a [`render.yaml`](render.yaml) Blueprint that creates a free Node web service in Singapore:

- Build: `npm ci --include=dev && npm run build`
- Start: `npm run start` (Next.js reads Render's `PORT`)
- Health check: `/`
- Node 22

Click the button, sign in with GitHub, and approve the Blueprint. The deploy needs no environment variables. Add `GEMINI_API_KEY` later if you want hosted prose. Free Render services spin down after inactivity, so the first request after a pause can take about a minute.

## Known limits

- Scanned PDFs without a text layer are rejected rather than OCR'd.
- Job URL imports only read public pages; some job boards block automated readers. Paste the description instead.
- Heuristic skill extraction is curated rather than exhaustive; unknown requirements can be under-matched.
- Gemini falls back to local prose on rate limits, timeouts, or schema failures. The report labels the fallback.
- The analyzer endpoint has no accounts or rate limiting. If you expose it publicly with a Gemini key, put a rate limit or proxy in front of it.
