import AppShell from "@/components/app/AppShell";
import LabCloudTray from "@/design/app/LabCloudTray";

export const metadata = { title: "Add resource · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabCloudTray">
      <LabCloudTray />
    </AppShell>
  );
}
