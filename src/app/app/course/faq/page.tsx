import AppShell from "@/components/app/AppShell";
import CourseFaq from "@/design/app/CourseFaq";

export const metadata = { title: "FAQ · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="CourseFaq">
      <CourseFaq />
    </AppShell>
  );
}
