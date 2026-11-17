import AppShell from "@/components/app/AppShell";
import ExamWhiteboard from "@/design/app/ExamWhiteboard";

export const metadata = { title: "Exam whiteboard · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ExamWhiteboard">
      <ExamWhiteboard />
    </AppShell>
  );
}
