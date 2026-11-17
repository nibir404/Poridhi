import AppShell from "@/components/app/AppShell";
import LabRunning from "@/design/app/LabRunning";

export const metadata = { title: "Lab · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabRunning">
      <LabRunning />
    </AppShell>
  );
}
