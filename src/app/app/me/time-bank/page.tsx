import AppShell from "@/components/app/AppShell";
import MeTimeBank from "@/design/app/MeTimeBank";

export const metadata = { title: "Time bank & coins · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeTimeBank">
      <MeTimeBank />
    </AppShell>
  );
}
