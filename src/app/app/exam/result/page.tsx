import AppShell from "@/components/app/AppShell";
import ExamPassed from "@/design/app/ExamPassed";

export const metadata = { title: "Exam passed · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ExamPassed">
      <ExamPassed />
    </AppShell>
  );
}
