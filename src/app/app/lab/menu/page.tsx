import AppShell from "@/components/app/AppShell";
import LabMenu from "@/design/app/LabMenu";

export const metadata = { title: "Lab menu · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabMenu">
      <LabMenu />
    </AppShell>
  );
}
