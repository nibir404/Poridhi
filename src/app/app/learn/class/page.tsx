import AppShell from "@/components/app/AppShell";
import ClassRecorded from "@/design/app/ClassRecorded";

export const metadata = { title: "Recorded class · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ClassRecorded">
      <ClassRecorded />
    </AppShell>
  );
}
