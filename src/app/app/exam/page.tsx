import AppShell from "@/components/app/AppShell";
import ExamIntro from "@/design/app/ExamIntro";
import ExamSidebar from "@/components/app/ExamSidebar";

export const metadata = { title: "Milestone exam · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ExamIntro">
      <ExamIntro />
      <ExamSidebar />
    </AppShell>
  );
}
