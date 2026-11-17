import AppShell from "@/components/app/AppShell";
import AuthSignIn from "@/design/app/AuthSignIn";

export const metadata = { title: "AuthSignIn · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="AuthSignIn">
      <AuthSignIn />
    </AppShell>
  );
}
