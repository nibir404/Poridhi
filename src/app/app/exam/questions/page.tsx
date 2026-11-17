import AppShell from "@/components/app/AppShell";
import ExamQuestions from "@/design/app/ExamQuestions";

export const metadata = { title: "Exam questions · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ExamQuestions">
      <ExamQuestions />
    </AppShell>
  );
}
