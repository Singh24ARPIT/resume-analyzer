import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { SettingsView } from "@/components/settings/settings-view";
import { requireViewer } from "@/lib/auth";
import { geminiConfig, isAiConfigured } from "@/lib/ai/config";
import { getWorkspaceCounts } from "@/lib/data/library";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Resume Analyzer profile, data, and AI settings.",
};

export default async function SettingsPage() {
  const viewer = await requireViewer();
  const counts = await getWorkspaceCounts(viewer);
  const aiConfigured = isAiConfigured();

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings."
        description="Manage your profile, see where data lives, and control how the analysis engine works."
      />
      <SettingsView
        viewer={{
          type: viewer.type,
          name: viewer.name,
          email: viewer.email,
          userId: viewer.type === "user" ? viewer.user.id : undefined,
        }}
        counts={counts}
        aiConfigured={aiConfigured}
        aiModel={aiConfigured ? geminiConfig.model : "resume-analyzer-local"}
      />
    </>
  );
}
