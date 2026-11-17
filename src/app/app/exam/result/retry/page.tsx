import AppShell from "@/components/app/AppShell";
import ExamFailed from "@/design/app/ExamFailed";

export const metadata = { title: "Exam not passed · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ExamFailed">
      <ExamFailed />
    </AppShell>
  );
}
