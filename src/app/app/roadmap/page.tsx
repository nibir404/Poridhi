import AppShell from "@/components/app/AppShell";
import RoadmapAll from "@/design/app/RoadmapAll";

export const metadata = { title: "Roadmap · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="RoadmapAll">
      <RoadmapAll />
    </AppShell>
  );
}
