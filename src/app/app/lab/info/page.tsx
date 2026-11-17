import AppShell from "@/components/app/AppShell";
import LabInfo from "@/design/app/LabInfo";

export const metadata = { title: "Lab info · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabInfo">
      <LabInfo />
    </AppShell>
  );
}
