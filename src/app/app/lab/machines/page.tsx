import AppShell from "@/components/app/AppShell";
import LabMachines from "@/design/app/LabMachines";

export const metadata = { title: "Machines & access · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabMachines">
      <LabMachines />
    </AppShell>
  );
}
