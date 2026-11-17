import AppShell from "@/components/app/AppShell";
import CourseOverview from "@/design/app/CourseOverview";

export const metadata = { title: "Course overview · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="CourseOverview">
      <CourseOverview />
    </AppShell>
  );
}
