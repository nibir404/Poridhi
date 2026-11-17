import AppShell from "@/components/app/AppShell";
import MeSupport from "@/design/app/MeSupport";

export const metadata = { title: "Support · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeSupport">
      <MeSupport />
    </AppShell>
  );
}
