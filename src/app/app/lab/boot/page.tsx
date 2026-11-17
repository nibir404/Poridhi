import AppShell from "@/components/app/AppShell";
import LabBoot from "@/design/app/LabBoot";

export const metadata = { title: "Starting lab · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabBoot">
      <LabBoot />
    </AppShell>
  );
}
