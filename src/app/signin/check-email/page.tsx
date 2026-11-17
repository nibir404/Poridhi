import AppShell from "@/components/app/AppShell";
import AuthCheckEmail from "@/design/app/AuthCheckEmail";

export const metadata = { title: "AuthCheckEmail · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="AuthCheckEmail">
      <AuthCheckEmail />
    </AppShell>
  );
}
