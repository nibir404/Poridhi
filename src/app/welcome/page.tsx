import AppShell from "@/components/app/AppShell";
import AuthWelcome from "@/design/app/AuthWelcome";

export const metadata = { title: "Welcome · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="AuthWelcome">
      <AuthWelcome />
    </AppShell>
  );
}
