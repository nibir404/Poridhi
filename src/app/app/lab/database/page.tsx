import AppShell from "@/components/app/AppShell";
import LabDatabase from "@/design/app/LabDatabase";

export const metadata = { title: "Database · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabDatabase">
      <LabDatabase />
    </AppShell>
  );
}
