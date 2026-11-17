import AppShell from "@/components/app/AppShell";
import ExamSubmit from "@/design/app/ExamSubmit";

export const metadata = { title: "Submit Q4 · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ExamSubmit">
      <ExamSubmit />
    </AppShell>
  );
}
