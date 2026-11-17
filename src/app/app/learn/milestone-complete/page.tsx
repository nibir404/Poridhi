import AppShell from "@/components/app/AppShell";
import MilestoneComplete from "@/design/app/MilestoneComplete";

export const metadata = { title: "Milestone complete · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MilestoneComplete">
      <MilestoneComplete />
    </AppShell>
  );
}
