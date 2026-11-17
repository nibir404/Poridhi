import AppShell from "@/components/app/AppShell";
import InterviewWhiteboard from "@/design/app/InterviewWhiteboard";

export const metadata = { title: "Interview · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="InterviewWhiteboard">
      <InterviewWhiteboard />
    </AppShell>
  );
}
