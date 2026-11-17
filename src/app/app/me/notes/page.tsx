import AppShell from "@/components/app/AppShell";
import NotesView from "@/components/app/NotesView";

export const metadata = { title: "Notes · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeNotes">
      <NotesView />
    </AppShell>
  );
}
