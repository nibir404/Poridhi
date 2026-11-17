import AppShell from "@/components/app/AppShell";
import ClassNotes from "@/design/app/ClassNotes";

export const metadata = { title: "My notes · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ClassNotes">
      <ClassNotes />
    </AppShell>
  );
}
