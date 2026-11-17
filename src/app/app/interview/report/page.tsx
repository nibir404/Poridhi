import AppShell from "@/components/app/AppShell";
import InterviewReport from "@/design/app/InterviewReport";

export const metadata = { title: "Interview report · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="InterviewReport">
      <InterviewReport />
    </AppShell>
  );
}
