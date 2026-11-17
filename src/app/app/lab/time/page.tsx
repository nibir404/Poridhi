import AppShell from "@/components/app/AppShell";
import LabTimeLow from "@/design/app/LabTimeLow";

export const metadata = { title: "Time running low · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabTimeLow">
      <LabTimeLow />
    </AppShell>
  );
}
