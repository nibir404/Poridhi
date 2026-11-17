import AppShell from "@/components/app/AppShell";
import QuickCheckResult from "@/design/app/QuickCheckResult";

export const metadata = { title: "Quick check result · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="QuickCheckResult">
      <QuickCheckResult />
    </AppShell>
  );
}
