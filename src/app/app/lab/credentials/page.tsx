import AppShell from "@/components/app/AppShell";
import LabCredentials from "@/design/app/LabCredentials";

export const metadata = { title: "Credentials · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="LabCredentials">
      <LabCredentials />
    </AppShell>
  );
}
