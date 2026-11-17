import AppShell from "@/components/app/AppShell";
import GateLocked from "@/design/app/GateLocked";

export const metadata = { title: "Locked · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="GateLocked">
      <GateLocked />
    </AppShell>
  );
}
