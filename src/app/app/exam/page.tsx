import AppShell from "@/components/app/AppShell";
import ExamIntro from "@/design/app/ExamIntro";

export const metadata = { title: "Milestone exam · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ExamIntro">
      <ExamIntro />
    </AppShell>
  );
}
