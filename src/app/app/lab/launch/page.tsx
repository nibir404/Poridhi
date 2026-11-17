import AppShell from "@/components/app/AppShell";
import LabLaunch from "@/design/app/LabLaunch";

export const metadata = { title: "Launch lab · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabLaunch">
      <LabLaunch />
    </AppShell>
  );
}
