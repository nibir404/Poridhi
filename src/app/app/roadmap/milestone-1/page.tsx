import AppShell from "@/components/app/AppShell";
import RoadmapMilestone from "@/design/app/RoadmapMilestone";
import RoadmapExplorer from "@/components/app/RoadmapExplorer";

export const metadata = { title: "Roadmap · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="RoadmapMilestone">
      <RoadmapMilestone />
      <RoadmapExplorer />
    </AppShell>
  );
}
