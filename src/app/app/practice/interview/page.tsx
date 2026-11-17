import AppShell from "@/components/app/AppShell";
import InterviewVoice from "@/design/app/InterviewVoice";

export const metadata = { title: "AI interview · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="InterviewVoice">
      <InterviewVoice />
    </AppShell>
  );
}
