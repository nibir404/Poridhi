import AppShell from "@/components/app/AppShell";
import AuthLevel from "@/design/app/AuthLevel";

export const metadata = { title: "Your level · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="AuthLevel">
      <AuthLevel />
    </AppShell>
  );
}
