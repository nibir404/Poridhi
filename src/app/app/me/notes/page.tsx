import AppShell from "@/components/app/AppShell";
import MeNotes from "@/design/app/MeNotes";

export const metadata = { title: "Notes · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeNotes">
      <MeNotes />
    </AppShell>
  );
}
