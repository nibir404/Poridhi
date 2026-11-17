import AppShell from "@/components/app/AppShell";
import RoadmapMilestone from "@/design/app/RoadmapMilestone";

export const metadata = { title: "Milestone 1 · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="RoadmapMilestone">
      <RoadmapMilestone />
    </AppShell>
  );
}
