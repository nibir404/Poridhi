import AppShell from "@/components/app/AppShell";
import Dashboard from "@/design/app/Dashboard";
import DashboardViz from "@/components/app/DashboardViz";

export const metadata = { title: "Dashboard · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="Dashboard">
      <Dashboard />
      <DashboardViz />
    </AppShell>
  );
}
