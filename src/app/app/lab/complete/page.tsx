import AppShell from "@/components/app/AppShell";
import LabComplete from "@/design/app/LabComplete";

export const metadata = { title: "Lab complete · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabComplete">
      <LabComplete />
    </AppShell>
  );
}
