import AppShell from "@/components/app/AppShell";
import MeSchedule from "@/design/app/MeSchedule";

export const metadata = { title: "Schedule · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeSchedule">
      <MeSchedule />
    </AppShell>
  );
}
