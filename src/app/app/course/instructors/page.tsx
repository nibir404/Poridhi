import AppShell from "@/components/app/AppShell";
import CourseInstructors from "@/design/app/CourseInstructors";

export const metadata = { title: "Instructors · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="CourseInstructors">
      <CourseInstructors />
    </AppShell>
  );
}
