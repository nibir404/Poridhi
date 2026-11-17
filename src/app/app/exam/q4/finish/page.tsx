import AppShell from "@/components/app/AppShell";
import ExamState1 from "@/design/app/ExamState1";

export const metadata = { title: "Finish exam · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ExamState1">
      <ExamState1 />
    </AppShell>
  );
}
