import AppShell from "@/components/app/AppShell";
import InterviewIntro from "@/design/app/InterviewIntro";

export const metadata = { title: "AI interview · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="InterviewIntro">
      <InterviewIntro />
    </AppShell>
  );
}
