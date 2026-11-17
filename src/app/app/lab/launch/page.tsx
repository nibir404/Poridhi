import AppShell from "@/components/app/AppShell";
import LabLaunch from "@/design/app/LabLaunch";
import LabGuideExtra from "@/components/app/LabGuideExtra";

export const metadata = { title: "Launch lab · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabLaunch">
      <LabLaunch />
      <LabGuideExtra />
    </AppShell>
  );
}
