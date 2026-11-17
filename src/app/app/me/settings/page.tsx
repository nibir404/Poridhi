import AppShell from "@/components/app/AppShell";
import MeSettings from "@/design/app/MeSettings";

export const metadata = { title: "Settings · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeSettings">
      <MeSettings />
    </AppShell>
  );
}
