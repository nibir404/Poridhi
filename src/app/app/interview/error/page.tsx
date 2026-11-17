import AppShell from "@/components/app/AppShell";
import InterviewError from "@/design/app/InterviewError";

export const metadata = { title: "Scoring error · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="InterviewError">
      <InterviewError />
    </AppShell>
  );
}
