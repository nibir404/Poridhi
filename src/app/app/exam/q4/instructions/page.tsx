import AppShell from "@/components/app/AppShell";
import ExamInstructions from "@/design/app/ExamInstructions";

export const metadata = { title: "Q4 instructions · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ExamInstructions">
      <ExamInstructions />
    </AppShell>
  );
}
