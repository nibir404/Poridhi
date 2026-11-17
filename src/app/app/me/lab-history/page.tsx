import AppShell from "@/components/app/AppShell";
import MeLabHistory from "@/design/app/MeLabHistory";

export const metadata = { title: "Lab history · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeLabHistory">
      <MeLabHistory />
    </AppShell>
  );
}
