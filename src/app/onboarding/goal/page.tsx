import AppShell from "@/components/app/AppShell";
import AuthGoal from "@/design/app/AuthGoal";

export const metadata = { title: "Your goal · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="AuthGoal">
      <AuthGoal />
    </AppShell>
  );
}
