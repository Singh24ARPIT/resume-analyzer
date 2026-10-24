import type { SkillCategory } from "@/lib/types";

export interface SkillDefinition {
  name: string;
  category: SkillCategory;
  aliases: string[];
  caseSensitiveAliases?: string[];
}

/**
 * A deliberately curated taxonomy. Matching aliases before comparing skills is
 * what keeps "React.js", "ReactJS", and "React" from looking like three
 * different requirements.
 */
export const SKILLS: SkillDefinition[] = [
  { name: "JavaScript", category: "language", aliases: ["js", "ecmascript"] },
  { name: "TypeScript", category: "language", aliases: ["ts"] },
  { name: "Python", category: "language", aliases: ["python3"] },
  { name: "Java", category: "language", aliases: [] },
  { name: "C++", category: "language", aliases: ["cpp"] },
  { name: "C#", category: "language", aliases: ["csharp", ".net c#"] },
  { name: "Go", category: "language", aliases: ["golang"], caseSensitiveAliases: ["Go"] },
  { name: "Rust", category: "language", aliases: [] },
  { name: "Ruby", category: "language", aliases: [] },
  { name: "PHP", category: "language", aliases: [] },
  { name: "Swift", category: "language", aliases: [] },
  { name: "Kotlin", category: "language", aliases: [] },
  { name: "Scala", category: "language", aliases: [] },
  { name: "SQL", category: "language", aliases: [] },
  { name: "HTML", category: "language", aliases: ["html5"] },
  { name: "CSS", category: "language", aliases: ["css3"] },
  { name: "Bash", category: "language", aliases: ["shell scripting", "shell"] },
  {
    name: "R",
    category: "language",
    aliases: ["r programming", "r language"],
    caseSensitiveAliases: ["R"],
  },
  { name: "Dart", category: "language", aliases: [] },

  { name: "React", category: "framework", aliases: ["react.js", "reactjs"] },
  { name: "Next.js", category: "framework", aliases: ["nextjs", "next js"] },
  { name: "Vue.js", category: "framework", aliases: ["vue", "vuejs"] },
  { name: "Nuxt", category: "framework", aliases: ["nuxt.js", "nuxtjs"] },
  { name: "Angular", category: "framework", aliases: ["angularjs"] },
  { name: "Svelte", category: "framework", aliases: ["sveltekit"] },
  { name: "Node.js", category: "framework", aliases: ["nodejs", "node"] },
  {
    name: "Express",
    category: "framework",
    aliases: ["express.js", "expressjs"],
    caseSensitiveAliases: ["Express"],
  },
  { name: "NestJS", category: "framework", aliases: ["nest.js", "nest"] },
  { name: "Django", category: "framework", aliases: [] },
  { name: "Flask", category: "framework", aliases: [] },
  { name: "FastAPI", category: "framework", aliases: ["fast api"] },
  {
    name: "Spring Boot",
    category: "framework",
    aliases: ["Spring"],
    caseSensitiveAliases: ["Spring"],
  },
  { name: "Ruby on Rails", category: "framework", aliases: ["rails", "ror"] },
  { name: "Laravel", category: "framework", aliases: [] },
  { name: ".NET", category: "framework", aliases: ["dotnet", "asp.net", "asp.net core"] },
  { name: "Tailwind CSS", category: "framework", aliases: ["tailwind", "tailwindcss"] },
  { name: "Bootstrap", category: "framework", aliases: [] },
  { name: "Redux", category: "framework", aliases: ["redux toolkit", "rtk"] },
  { name: "Zustand", category: "framework", aliases: [] },
  { name: "React Query", category: "framework", aliases: ["tanstack query", "react-query"] },
  { name: "GraphQL", category: "framework", aliases: ["graph ql", "apollo"] },
  { name: "REST APIs", category: "framework", aliases: ["rest api", "restful"] },
  { name: "gRPC", category: "framework", aliases: [] },
  { name: "WebSockets", category: "framework", aliases: ["websocket", "socket.io"] },
  { name: "React Native", category: "framework", aliases: ["react-native"] },
  { name: "Flutter", category: "framework", aliases: [] },
  { name: "Electron", category: "framework", aliases: [] },
  {
    name: "Design systems",
    category: "framework",
    aliases: [
      "design system",
      "design-system",
      "design-systems",
      "component library",
    ],
  },
  { name: "Responsive design", category: "framework", aliases: ["responsive ui", "mobile-first"] },
  { name: "Accessibility", category: "soft", aliases: ["a11y", "wcag", "aria"] },
  { name: "Web performance", category: "framework", aliases: ["web vitals", "core web vitals", "performance optimization", "lighthouse"] },
  { name: "SEO", category: "framework", aliases: ["search engine optimization"] },
  { name: "Progressive Web Apps", category: "framework", aliases: ["pwa", "service workers"] },

  { name: "AWS", category: "cloud", aliases: ["amazon web services", "ec2", "s3", "lambda"] },
  { name: "Azure", category: "cloud", aliases: ["microsoft azure"] },
  { name: "GCP", category: "cloud", aliases: ["google cloud", "google cloud platform"] },
  { name: "Vercel", category: "cloud", aliases: [] },
  { name: "Netlify", category: "cloud", aliases: [] },
  { name: "Docker", category: "cloud", aliases: ["containers"] },
  { name: "Kubernetes", category: "cloud", aliases: ["k8s"] },
  { name: "Terraform", category: "cloud", aliases: ["infrastructure as code", "iac"] },
  { name: "GitHub Actions", category: "cloud", aliases: ["github action"] },
  { name: "CI/CD", category: "cloud", aliases: ["cicd", "continuous integration", "continuous delivery"] },
  { name: "Jenkins", category: "cloud", aliases: [] },
  { name: "Nginx", category: "cloud", aliases: [] },
  { name: "Linux", category: "cloud", aliases: ["ubuntu", "unix"] },
  { name: "Serverless", category: "cloud", aliases: ["serverless functions", "edge functions"] },

  { name: "PostgreSQL", category: "data", aliases: ["postgres", "psql"] },
  { name: "MySQL", category: "data", aliases: [] },
  { name: "MongoDB", category: "data", aliases: ["mongo"] },
  { name: "Redis", category: "data", aliases: [] },
  { name: "Supabase", category: "data", aliases: [] },
  { name: "Firebase", category: "data", aliases: ["firestore"] },
  { name: "Prisma", category: "data", aliases: [] },
  { name: "SQLite", category: "data", aliases: [] },
  { name: "Elasticsearch", category: "data", aliases: ["elastic search", "opensearch"] },
  { name: "Kafka", category: "data", aliases: ["apache kafka"] },
  {
    name: "Spark",
    category: "data",
    aliases: ["apache spark", "pyspark"],
    caseSensitiveAliases: ["Spark"],
  },
  { name: "Airflow", category: "data", aliases: ["apache airflow"] },
  { name: "Snowflake", category: "data", aliases: [] },
  { name: "BigQuery", category: "data", aliases: ["big query"] },
  { name: "DynamoDB", category: "data", aliases: ["dynamo db"] },
  { name: "RabbitMQ", category: "data", aliases: ["rabbit mq"] },
  { name: "Data modeling", category: "data", aliases: ["data models", "schema design"] },
  { name: "ETL", category: "data", aliases: ["elt", "data pipelines"] },

  { name: "Machine Learning", category: "ml", aliases: ["ml", "machine-learning"] },
  { name: "Deep Learning", category: "ml", aliases: ["neural networks"] },
  { name: "PyTorch", category: "ml", aliases: ["torch"] },
  { name: "TensorFlow", category: "ml", aliases: ["tf"] },
  { name: "scikit-learn", category: "ml", aliases: ["sklearn", "scikit learn"] },
  { name: "Pandas", category: "ml", aliases: [] },
  { name: "NumPy", category: "ml", aliases: ["numpy"] },
  { name: "NLP", category: "ml", aliases: ["natural language processing"] },
  { name: "LLMs", category: "ml", aliases: ["large language models", "large language model"] },
  { name: "RAG", category: "ml", aliases: ["retrieval augmented generation"] },
  { name: "Computer Vision", category: "ml", aliases: ["image recognition"] },
  { name: "MLOps", category: "ml", aliases: ["ml ops"] },
  { name: "Hugging Face", category: "ml", aliases: ["huggingface", "transformers"] },
  { name: "LangChain", category: "ml", aliases: ["lang chain"] },
  { name: "OpenAI API", category: "ml", aliases: ["openai", "gpt-4", "gpt-4o"] },
  { name: "Gemini API", category: "ml", aliases: ["google gemini", "gemini"] },
  { name: "Prompt Engineering", category: "ml", aliases: ["prompt design"] },
  { name: "Vector databases", category: "ml", aliases: ["vector database", "pinecone", "weaviate"] },

  { name: "Git", category: "tool", aliases: [] },
  { name: "GitHub", category: "tool", aliases: [] },
  { name: "GitLab", category: "tool", aliases: [] },
  { name: "Jira", category: "tool", aliases: [] },
  { name: "Figma", category: "tool", aliases: [] },
  { name: "Storybook", category: "tool", aliases: [] },
  { name: "Jest", category: "tool", aliases: [] },
  { name: "Vitest", category: "tool", aliases: [] },
  { name: "Playwright", category: "tool", aliases: [] },
  { name: "Cypress", category: "tool", aliases: [] },
  { name: "Testing Library", category: "tool", aliases: ["react testing library", "rtl"] },
  { name: "Postman", category: "tool", aliases: [] },
  { name: "Webpack", category: "tool", aliases: [] },
  { name: "Vite", category: "tool", aliases: [] },
  { name: "ESLint", category: "tool", aliases: ["es lint"] },
  { name: "Prettier", category: "tool", aliases: [] },
  { name: "Sentry", category: "tool", aliases: [] },
  { name: "Datadog", category: "tool", aliases: [] },
  { name: "Grafana", category: "tool", aliases: [] },
  { name: "Mixpanel", category: "tool", aliases: [] },
  { name: "Amplitude", category: "tool", aliases: [] },
  {
    name: "Google Analytics",
    category: "tool",
    aliases: ["ga4", "google analytics 4"],
  },
  { name: "A/B testing", category: "soft", aliases: ["ab testing", "split testing", "experimentation"] },
  { name: "Agile", category: "soft", aliases: ["agile methodology"] },
  { name: "Scrum", category: "soft", aliases: [] },
  { name: "Kanban", category: "soft", aliases: [] },

  { name: "Leadership", category: "soft", aliases: ["team lead", "technical leadership"] },
  { name: "Mentoring", category: "soft", aliases: ["mentorship", "coaching"] },
  { name: "Communication", category: "soft", aliases: ["written communication", "verbal communication"] },
  { name: "Collaboration", category: "soft", aliases: ["cross-functional", "teamwork"] },
  { name: "Problem solving", category: "soft", aliases: ["problem-solving", "analytical thinking"] },
  { name: "Ownership", category: "soft", aliases: ["end-to-end ownership", "autonomy"] },
  { name: "Stakeholder management", category: "soft", aliases: ["stakeholder communication"] },
  { name: "Product thinking", category: "soft", aliases: ["product mindset", "product sense"] },
];

const aliasIndex = new Map<string, SkillDefinition>();

for (const skill of SKILLS) {
  aliasIndex.set(skill.name.toLowerCase(), skill);
  for (const alias of skill.aliases) {
    aliasIndex.set(alias.toLowerCase(), skill);
  }
}

export function canonicalizeSkill(raw: string): SkillDefinition | null {
  return aliasIndex.get(raw.trim().toLowerCase()) ?? null;
}

export function canonicalSkillName(raw: string): string {
  return canonicalizeSkill(raw)?.name ?? raw.trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function aliasSource(alias: string) {
  const source = escapeRegExp(alias);
  // Guards are always case-aware, even when the alias pattern itself is
  // case-sensitive. A leading dot is excluded so product names like "Next.js"
  // or "React.js" do not register as the JavaScript alias "js".
  const start = /^[a-z0-9]/i.test(alias) ? "(?<![A-Za-z0-9+#.])" : "";
  const end = /[a-z0-9+#]$/i.test(alias) ? "(?![A-Za-z0-9+#])" : "";
  return `${start}${source}${end}`;
}

function patternForAlias(alias: string, caseSensitive = false) {
  return new RegExp(aliasSource(alias), caseSensitive ? "g" : "gi");
}

const patternsBySkill = new Map<
  string,
  Array<{ alias: string; pattern: RegExp; caseSensitive: boolean }>
>();

function getPatterns(skill: SkillDefinition) {
  const cached = patternsBySkill.get(skill.name);
  if (cached) return cached;

  const patterns = [skill.name, ...skill.aliases].map((alias) => {
    const caseSensitive = skill.caseSensitiveAliases?.includes(alias) ?? false;
    return { alias, pattern: patternForAlias(alias, caseSensitive), caseSensitive };
  });

  patternsBySkill.set(skill.name, patterns);
  return patterns;
}

export interface SkillHit {
  skill: SkillDefinition;
  count: number;
  evidence: string;
}

function evidenceFor(text: string, alias: string) {
  const linePattern = new RegExp(aliasSource(alias), "i");
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (linePattern.test(line)) {
      return line.trim().replace(/\s+/g, " ").slice(0, 220);
    }
  }
  return "";
}

export function findSkillInText(
  text: string,
  skillName: string,
): SkillHit | null {
  const skill = canonicalizeSkill(skillName);
  if (!skill) {
    const escaped = escapeRegExp(skillName.trim());
    const start = /^[a-z0-9]/i.test(skillName.trim())
      ? "(?<![a-z0-9+#])"
      : "";
    const end = /[a-z0-9+#]$/i.test(skillName.trim())
      ? "(?![a-z0-9+#])"
      : "";
    const pattern = new RegExp(`${start}${escaped}${end}`, "gi");
    const count = text.match(pattern)?.length ?? 0;
    if (!count) return null;
    return {
      skill: { name: skillName.trim(), category: "tool", aliases: [] },
      count,
      evidence: evidenceFor(text, skillName.trim()),
    };
  }

  let count = 0;
  let evidence = "";

  for (const { pattern, alias } of getPatterns(skill)) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (!matches?.length) continue;
    count += matches.length;
    if (!evidence) evidence = evidenceFor(text, alias);
  }

  if (!count) return null;
  return { skill, count, evidence };
}

export function detectSkills(text: string): SkillHit[] {
  const hits: SkillHit[] = [];

  for (const skill of SKILLS) {
    const hit = findSkillInText(text, skill.name);
    if (hit) hits.push(hit);
  }

  return hits.sort((a, b) => b.count - a.count);
}

export function detectSkillNames(text: string): string[] {
  return detectSkills(text).map((hit) => hit.skill.name);
}

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  language: "Language",
  framework: "Framework",
  cloud: "Cloud & DevOps",
  data: "Data",
  ml: "AI / ML",
  tool: "Tool",
  soft: "Practice",
};
