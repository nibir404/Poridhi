import AppShell from "@/components/app/AppShell";
import RoadmapCanvas from "@/components/app/RoadmapCanvas";

export const metadata = { title: "Roadmap · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="RoadmapAll">
      <RoadmapCanvas />
    </AppShell>
  );
}
