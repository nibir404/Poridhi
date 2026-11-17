import AppShell from "@/components/app/AppShell";
import InterviewFeedback from "@/design/app/InterviewFeedback";

export const metadata = { title: "Feedback · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="InterviewFeedback">
      <InterviewFeedback />
    </AppShell>
  );
}
