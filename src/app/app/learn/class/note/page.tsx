import AppShell from "@/components/app/AppShell";
import ClassNoteEdit from "@/design/app/ClassNoteEdit";

export const metadata = { title: "Add note · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ClassNoteEdit">
      <ClassNoteEdit />
    </AppShell>
  );
}
