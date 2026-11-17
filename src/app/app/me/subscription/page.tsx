import AppShell from "@/components/app/AppShell";
import MeSubscription from "@/design/app/MeSubscription";

export const metadata = { title: "Subscription · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeSubscription">
      <MeSubscription />
    </AppShell>
  );
}
