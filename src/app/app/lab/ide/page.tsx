import AppShell from "@/components/app/AppShell";
import LabIde from "@/design/app/LabIde";

export const metadata = { title: "IDE + Puku CLI · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabIde">
      <LabIde />
    </AppShell>
  );
}
