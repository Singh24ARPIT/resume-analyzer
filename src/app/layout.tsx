import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Resume Analyzer — Match your resume to any job",
    template: "%s · Resume Analyzer",
  },
  description:
    "Match your resume to any job description. Get an explainable fit score, missing skills, ATS checks, and AI-powered rewrites in seconds.",
  keywords: [
    "resume analyzer",
    "AI resume",
    "ATS checker",
    "job description match",
    "resume feedback",
  ],
  openGraph: {
    title: "Resume Analyzer — Know your fit before you apply",
    description:
      "Know your resume's fit before you apply. Explainable scoring, skill gaps, ATS checks, and tailored AI rewrites.",
    type: "website",
    url: appUrl,
    siteName: "Resume Analyzer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Analyzer — Know your fit before you apply",
    description:
      "Know your resume's fit before you apply. Explainable scoring, skill gaps, ATS checks, and tailored AI rewrites.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
