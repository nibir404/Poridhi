import AppShell from "@/components/app/AppShell";
import ExamIDE from "@/design/app/ExamIDE";

export const metadata = { title: "AI exam · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ExamIDE">
      <ExamIDE />
    </AppShell>
  );
}
