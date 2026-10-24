import type {
  AnalysisResult,
  AnalysisSummary,
  ComparisonResult,
  CoverLetterRecord,
  JobRecord,
  ResumeRecord,
} from "@/lib/types";

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

export const sampleAnalysis: AnalysisResult = {
  id: "sample",
  createdAt: daysAgo(1),
  resume: {
    title: "Arpit Singh — Resume v3",
    fileName: "Arpit_Singh_Resume_v3.pdf",
    wordCount: 486,
  },
  job: {
    title: "Senior Frontend Engineer",
    company: "Lumen Labs",
    sourceUrl: "https://example.com/careers/senior-frontend-engineer",
  },
  overallScore: 84,
  scores: {
    skills: 92,
    experience: 78,
    semantic: 82,
    preferred: 80,
    ats: 88,
    impact: 74,
  },
  verdict: "Strong match",
  summary:
    "Your resume covers the core React and TypeScript requirements and shows measurable product impact. The main gaps are GraphQL, end-to-end testing, and experimentation — all fixable without changing your career story.",
  skills: {
    matched: [
      { name: "React", category: "framework" },
      { name: "TypeScript", category: "language" },
      { name: "Next.js", category: "framework" },
      { name: "JavaScript", category: "language" },
      { name: "Tailwind CSS", category: "framework" },
      { name: "REST APIs", category: "tool" },
      { name: "Jest", category: "tool" },
      { name: "Git", category: "tool" },
      { name: "Design systems", category: "framework" },
      { name: "Accessibility", category: "soft" },
    ],
    missing: [
      { name: "GraphQL", category: "tool" },
      { name: "Playwright", category: "tool" },
      { name: "A/B testing", category: "soft" },
      { name: "Web performance monitoring", category: "tool" },
    ],
    bonus: [
      { name: "Figma", category: "tool" },
      { name: "Storybook", category: "tool" },
      { name: "Node.js", category: "framework" },
      { name: "Vercel", category: "cloud" },
    ],
  },
  keywords: [
    { term: "React", importance: "must", inResume: true, count: 9 },
    { term: "TypeScript", importance: "must", inResume: true, count: 7 },
    { term: "Next.js", importance: "must", inResume: true, count: 5 },
    { term: "GraphQL", importance: "must", inResume: false, count: 0 },
    { term: "Design systems", importance: "must", inResume: true, count: 4 },
    { term: "Playwright", importance: "nice", inResume: false, count: 0 },
    { term: "A/B testing", importance: "nice", inResume: false, count: 0 },
    { term: "Accessibility", importance: "nice", inResume: true, count: 3 },
    { term: "Performance", importance: "nice", inResume: true, count: 6 },
    { term: "Mentoring", importance: "nice", inResume: true, count: 2 },
  ],
  ats: [
    {
      id: "text-layer",
      label: "Text layer detected",
      status: "pass",
      detail: "1,842 characters extracted cleanly from a text-based PDF.",
    },
    {
      id: "sections",
      label: "Standard section headers",
      status: "pass",
      detail: "Summary, experience, projects, education, and skills were detected.",
    },
    {
      id: "contact",
      label: "Contact details present",
      status: "pass",
      detail: "Email and phone found in the header and removed before AI calls.",
    },
    {
      id: "length",
      label: "Resume length",
      status: "pass",
      detail: "1 page · 486 words — inside the recommended 1–2 page range.",
    },
    {
      id: "metrics",
      label: "Quantified achievements",
      status: "warn",
      detail: "6 of 14 bullets include a number or percentage. Aim for 8+.",
    },
    {
      id: "verbs",
      label: "Strong action verbs",
      status: "pass",
      detail: "12 of 14 bullets start with a strong action verb.",
    },
    {
      id: "stuffing",
      label: "No keyword stuffing",
      status: "pass",
      detail: "No term appears more than 9 times; keyword density is healthy.",
    },
    {
      id: "format",
      label: "ATS-friendly format",
      status: "pass",
      detail: "Single-column PDF with selectable text and no embedded tables.",
    },
  ],
  strengths: [
    "Core stack alignment is excellent: React, TypeScript, and Next.js appear in both the resume and the must-have list.",
    "Impact is concrete — 42% faster first chart, 18k monthly users, and a 28% bundle-size reduction give the claims weight.",
    "Design-system and accessibility experience is a differentiator for a product-led frontend team.",
  ],
  gaps: [
    {
      title: "GraphQL is missing",
      severity: "high",
      why: "It is listed as a must-have in the job description and appears in three of the responsibilities.",
      fix: "Add a project bullet where you consumed or designed a GraphQL API. If you have not used it, build a small schema on top of an existing REST service this week.",
    },
    {
      title: "No end-to-end testing story",
      severity: "medium",
      why: "The role owns release quality and explicitly mentions Playwright.",
      fix: "Add Playwright to one project and describe the coverage you added — for example, 'covered checkout flow with 18 Playwright tests, cutting regression bugs by 30%.'",
    },
    {
      title: "Experimentation is implied, not shown",
      severity: "medium",
      why: "A/B testing appears in the preferred skills and in the growth-focused responsibilities.",
      fix: "Quantify one experiment you shipped: hypothesis, sample size, and lift. Even a small internal test counts.",
    },
    {
      title: "Seniority signals are soft",
      severity: "low",
      why: "The JD asks for mentoring and technical leadership; your resume mentions collaboration but not ownership.",
      fix: "Name the scope: mentored two engineers, led a migration, or owned a service. Specific ownership reads more senior than 'worked with'.",
    },
  ],
  sectionFeedback: [
    {
      section: "Experience",
      score: 86,
      feedback:
        "Strong, specific bullets with real outcomes. Lead with the most senior scope first and keep the metrics in the first line of each role.",
    },
    {
      section: "Projects",
      score: 79,
      feedback:
        "Good range, but two projects read like feature lists. Add the problem, the constraint, and the result. The analytics dashboard is your strongest story — give it more room.",
    },
    {
      section: "Skills",
      score: 90,
      feedback:
        "Clean grouping and no keyword stuffing. Move GraphQL-adjacent experience up if you have any, and remove tools you would not want to be interviewed on.",
    },
    {
      section: "Summary",
      score: 72,
      feedback:
        "The summary describes you, not the role. Rewrite it around the target: product-minded frontend engineer with design-system and performance depth.",
    },
  ],
  bulletRewrites: [
    {
      original: "Worked on the analytics dashboard and improved performance.",
      improved:
        "Rebuilt the analytics dashboard in Next.js, cutting time-to-first-chart by 42% for 18k monthly users.",
      rationale:
        "Names the stack, the user-facing metric, and the audience. Every claim already exists in your resume.",
      keywordsAdded: ["Next.js", "performance"],
    },
    {
      original: "Helped build the design system and worked with designers.",
      improved:
        "Led the design-system rollout across 6 product teams, shipping 24 accessible components and reducing UI defects by 28%.",
      rationale:
        "Turns 'helped' into ownership and quantifies adoption — exactly the seniority signal this role asks for.",
      keywordsAdded: ["design systems", "accessibility"],
    },
    {
      original: "Responsible for testing and code quality.",
      improved:
        "Introduced Playwright smoke tests and a PR quality checklist, raising release confidence and cutting hotfixes by 35%.",
      rationale:
        "Replaces a passive responsibility with a concrete practice and outcome. Only use this if the testing work is true.",
      keywordsAdded: ["Playwright", "quality"],
    },
  ],
  suggestedSummary:
    "Product-minded frontend engineer with 4+ years building accessible, design-system-led React applications. Shipped performance work that cut time-to-first-chart by 42% and led a component rollout across six teams. Looking for a senior role where craft and measurable product impact matter equally.",
  interviewQuestions: [
    "Walk us through the design-system rollout. How did you get six teams to adopt it?",
    "How did you measure the 42% improvement in time-to-first-chart?",
    "Tell us about a time you pushed back on a design that was not accessible.",
    "How would you introduce Playwright to a team that currently relies on manual QA?",
  ],
  model: "rolefit-sample",
};

export const sampleCoverLetter: CoverLetterRecord = {
  id: "sample-letter",
  analysisId: "sample",
  tone: "professional",
  title: "Senior Frontend Engineer · Lumen Labs",
  body: `Dear Lumen Labs hiring team,

I am applying for the Senior Frontend Engineer role. I build accessible, design-system-led React applications, and the combination of product craft and performance work in this role is exactly where I do my best work.

At my current role, I rebuilt an analytics dashboard in Next.js and reduced time-to-first-chart by 42% for 18,000 monthly users. I also led a design-system rollout across six teams, shipping 24 accessible components and cutting UI defects by 28%. Those outcomes came from the same instinct this role describes: treat frontend performance and interface quality as product features, not cleanup.

I would welcome the chance to bring that approach to Lumen Labs, particularly the work on a fast, accessible product surface used by a large customer base. Thank you for your time and consideration.

Sincerely,
Arpit Singh`,
  createdAt: daysAgo(1),
};

export const demoAnalyses: AnalysisSummary[] = [
  {
    id: "sample",
    resumeTitle: "Arpit Singh — Resume v3",
    jobTitle: "Senior Frontend Engineer",
    company: "Lumen Labs",
    overallScore: 84,
    createdAt: daysAgo(1),
  },
  {
    id: "analysis-product-engineer",
    resumeTitle: "Arpit Singh — Resume v3",
    jobTitle: "Product Engineer",
    company: "Northwind",
    overallScore: 78,
    createdAt: daysAgo(3),
  },
  {
    id: "analysis-fullstack",
    resumeTitle: "Arpit Singh — Resume v2",
    jobTitle: "Full Stack Developer",
    company: "Aperture",
    overallScore: 71,
    createdAt: daysAgo(6),
  },
  {
    id: "analysis-frontend",
    resumeTitle: "Arpit Resume — Short",
    jobTitle: "Frontend Engineer",
    company: "Kite",
    overallScore: 66,
    createdAt: daysAgo(9),
  },
  {
    id: "analysis-swe",
    resumeTitle: "Arpit Singh — Resume v3",
    jobTitle: "Software Engineer II",
    company: "Meridian",
    overallScore: 91,
    createdAt: daysAgo(12),
  },
  {
    id: "analysis-design-engineer",
    resumeTitle: "Arpit Singh — Resume v3",
    jobTitle: "Design Engineer",
    company: "Orbit",
    overallScore: 82,
    createdAt: daysAgo(16),
  },
  {
    id: "analysis-react",
    resumeTitle: "Arpit Singh — Resume v2",
    jobTitle: "React Developer",
    company: "Fable",
    overallScore: 74,
    createdAt: daysAgo(21),
  },
  {
    id: "analysis-ui",
    resumeTitle: "Arpit Resume — Short",
    jobTitle: "UI Engineer",
    company: "Cinder",
    overallScore: 79,
    createdAt: daysAgo(28),
  },
];

export const demoResumes: ResumeRecord[] = [
  {
    id: "resume-v3",
    title: "Arpit Singh — Resume v3",
    fileName: "Arpit_Singh_Resume_v3.pdf",
    filePath: "demo/resume-v3.pdf",
    fileType: "application/pdf",
    fileSize: 248_000,
    wordCount: 486,
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Jest", "Figma"],
    createdAt: daysAgo(4),
  },
  {
    id: "resume-v2",
    title: "Arpit Singh — Resume v2",
    fileName: "Arpit_Singh_Resume_v2.pdf",
    filePath: "demo/resume-v2.pdf",
    fileType: "application/pdf",
    fileSize: 236_000,
    wordCount: 512,
    skills: ["React", "JavaScript", "Node.js", "REST APIs", "Git"],
    createdAt: daysAgo(24),
  },
  {
    id: "resume-short",
    title: "Arpit Resume — Short",
    fileName: "Arpit_Resume_Short.pdf",
    filePath: "demo/resume-short.pdf",
    fileType: "application/pdf",
    fileSize: 182_000,
    wordCount: 344,
    skills: ["React", "TypeScript", "CSS", "Figma"],
    createdAt: daysAgo(41),
  },
];

export const demoJobs: JobRecord[] = [
  {
    id: "job-lumen",
    title: "Senior Frontend Engineer",
    company: "Lumen Labs",
    sourceUrl: "https://example.com/careers/senior-frontend-engineer",
    mustHaveSkills: ["React", "TypeScript", "Next.js", "GraphQL", "Design systems"],
    createdAt: daysAgo(1),
  },
  {
    id: "job-northwind",
    title: "Product Engineer",
    company: "Northwind",
    sourceUrl: null,
    mustHaveSkills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    createdAt: daysAgo(3),
  },
  {
    id: "job-aperture",
    title: "Full Stack Developer",
    company: "Aperture",
    sourceUrl: "https://example.com/jobs/full-stack",
    mustHaveSkills: ["JavaScript", "React", "Node.js", "SQL"],
    createdAt: daysAgo(6),
  },
];

export const demoComparison: ComparisonResult = {
  id: "comparison-sample",
  jobTitle: "Senior Frontend Engineer",
  company: "Lumen Labs",
  bestResumeId: "resume-v3",
  verdict:
    "Resume v3 wins on must-have skill coverage and measurable impact. The short version is cleaner, but it drops the design-system and performance evidence this role explicitly asks for.",
  createdAt: daysAgo(1),
  entries: [
    {
      resumeId: "resume-v3",
      resumeTitle: "Arpit Singh — Resume v3",
      overallScore: 84,
      scores: {
        skills: 92,
        experience: 78,
        semantic: 82,
        preferred: 80,
        ats: 88,
        impact: 74,
      },
      matchedCount: 10,
      missingCount: 4,
      atsScore: 88,
    },
    {
      resumeId: "resume-v2",
      resumeTitle: "Arpit Singh — Resume v2",
      overallScore: 76,
      scores: {
        skills: 81,
        experience: 72,
        semantic: 75,
        preferred: 70,
        ats: 82,
        impact: 68,
      },
      matchedCount: 8,
      missingCount: 6,
      atsScore: 82,
    },
    {
      resumeId: "resume-short",
      resumeTitle: "Arpit Resume — Short",
      overallScore: 69,
      scores: {
        skills: 74,
        experience: 64,
        semantic: 70,
        preferred: 66,
        ats: 78,
        impact: 61,
      },
      matchedCount: 6,
      missingCount: 8,
      atsScore: 78,
    },
  ],
};

export const demoStats = {
  totalAnalyses: demoAnalyses.length,
  averageScore: Math.round(
    demoAnalyses.reduce((sum, item) => sum + item.overallScore, 0) /
      demoAnalyses.length,
  ),
  bestScore: Math.max(...demoAnalyses.map((item) => item.overallScore)),
  resumeCount: demoResumes.length,
  trend: [
    { label: "Aug 30", score: 61 },
    { label: "Sep 6", score: 66 },
    { label: "Sep 13", score: 64 },
    { label: "Sep 20", score: 70 },
    { label: "Sep 27", score: 72 },
    { label: "Oct 4", score: 69 },
    { label: "Oct 11", score: 75 },
    { label: "Oct 18", score: 78 },
  ],
};
