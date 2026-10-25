export const DEMO_COOKIE = "resume_analyzer_demo";
export const DEMO_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)?.trim();

export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    !url.includes("your-project") &&
    !url.includes("xxxx"),
);

export function getSupabaseConfig() {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }

  return { url, anonKey };
}
