import AppShell from "@/components/app/AppShell";
import LabFiles from "@/design/app/LabFiles";

export const metadata = { title: "Files · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabFiles">
      <LabFiles />
    </AppShell>
  );
}
