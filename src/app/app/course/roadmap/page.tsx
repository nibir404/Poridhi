import AppShell from "@/components/app/AppShell";
import CourseRoadmap from "@/design/app/CourseRoadmap";

export const metadata = { title: "Course roadmap · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="CourseRoadmap">
      <CourseRoadmap />
    </AppShell>
  );
}
