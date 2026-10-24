import { DemoBanner } from "@/components/app/demo-banner";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { requireViewer } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await requireViewer();
  const sidebarViewer = {
    name: viewer.name,
    email: viewer.email,
    type: viewer.type,
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
      <Sidebar viewer={sidebarViewer} />
      <div className="flex min-h-screen min-w-0 flex-col">
        <Topbar viewer={sidebarViewer} />
        {viewer.type === "demo" ? <DemoBanner /> : null}
        <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mx-auto w-full max-w-[1180px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
