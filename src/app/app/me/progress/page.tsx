import AppShell from "@/components/app/AppShell";
import MeProgress from "@/design/app/MeProgress";

export const metadata = { title: "Progress · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeProgress">
      <MeProgress />
    </AppShell>
  );
}
