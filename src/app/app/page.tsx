import AppShell from "@/components/app/AppShell";
import Dashboard from "@/design/app/Dashboard";

export const metadata = { title: "Dashboard · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="Dashboard">
      <Dashboard />
    </AppShell>
  );
}
