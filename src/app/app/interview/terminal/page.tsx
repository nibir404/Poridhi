import AppShell from "@/components/app/AppShell";
import InterviewTerminal from "@/design/app/InterviewTerminal";

export const metadata = { title: "Interview terminal · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="InterviewTerminal">
      <InterviewTerminal />
    </AppShell>
  );
}
