import AppShell from "@/components/app/AppShell";
import ExamState2 from "@/design/app/ExamState2";

export const metadata = { title: "Q4 review · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ExamState2">
      <ExamState2 />
    </AppShell>
  );
}
