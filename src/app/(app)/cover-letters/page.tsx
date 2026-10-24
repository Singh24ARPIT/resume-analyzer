import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { CoverLettersView } from "@/components/cover-letters/cover-letters-view";
import { requireViewer } from "@/lib/auth";
import {
  getAnalysisSummaries,
  getCoverLetterLibrary,
} from "@/lib/data/library";

export const metadata: Metadata = {
  title: "Cover letters",
  description: "Generate grounded cover letter drafts from your analyses.",
};

export default async function CoverLettersPage({
  searchParams,
}: {
  searchParams: Promise<{ analysis?: string }>;
}) {
  const viewer = await requireViewer();
  const params = await searchParams;
  const [analyses, letters] = await Promise.all([
    getAnalysisSummaries(viewer),
    getCoverLetterLibrary(viewer),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Cover letters"
        title="A first draft that already knows the job."
        description="Letters are generated from a completed analysis, so they cite your real strengths and avoid the skills you do not have."
      />
      <CoverLettersView
        mode={viewer.type}
        analyses={analyses}
        initialLetters={letters}
        initialAnalysisId={params.analysis}
      />
    </>
  );
}
