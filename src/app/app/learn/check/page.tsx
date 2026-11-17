import AppShell from "@/components/app/AppShell";
import QuickCheck from "@/design/app/QuickCheck";

export const metadata = { title: "Quick check · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="QuickCheck">
      <QuickCheck />
    </AppShell>
  );
}
