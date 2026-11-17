import AppShell from "@/components/app/AppShell";
import ClassLive from "@/design/app/ClassLive";

export const metadata = { title: "Live class · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ClassLive">
      <ClassLive />
    </AppShell>
  );
}
