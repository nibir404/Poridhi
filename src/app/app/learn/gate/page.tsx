import AppShell from "@/components/app/AppShell";
import GatePro from "@/design/app/GatePro";

export const metadata = { title: "Pro gate · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="GatePro">
      <GatePro />
    </AppShell>
  );
}
