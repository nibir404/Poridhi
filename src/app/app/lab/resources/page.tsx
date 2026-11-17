import AppShell from "@/components/app/AppShell";
import LabResources from "@/design/app/LabResources";

export const metadata = { title: "Resources · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabResources">
      <LabResources />
    </AppShell>
  );
}
