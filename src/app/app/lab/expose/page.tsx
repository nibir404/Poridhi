import AppShell from "@/components/app/AppShell";
import LabExposePort from "@/design/app/LabExposePort";

export const metadata = { title: "Expose a port · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabExposePort">
      <LabExposePort />
    </AppShell>
  );
}
