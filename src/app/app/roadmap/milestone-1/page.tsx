import AppShell from "@/components/app/AppShell";
import RoadmapMilestone from "@/design/app/RoadmapMilestone";

export const metadata = { title: "RoadmapMilestone · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="RoadmapMilestone">
      <RoadmapMilestone />
    </AppShell>
  );
}
