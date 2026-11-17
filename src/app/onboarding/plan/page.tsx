import AppShell from "@/components/app/AppShell";
import AuthPlan from "@/design/app/AuthPlan";

export const metadata = { title: "Choose a plan · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="AuthPlan">
      <AuthPlan />
    </AppShell>
  );
}
