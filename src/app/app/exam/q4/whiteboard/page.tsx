import AppShell from "@/components/app/AppShell";
import ExamWhiteboard from "@/design/app/ExamWhiteboard";

export const metadata = { title: "Q4 whiteboard · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ExamWhiteboard">
      <ExamWhiteboard />
    </AppShell>
  );
}
