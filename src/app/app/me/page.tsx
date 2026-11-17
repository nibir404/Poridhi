import AppShell from "@/components/app/AppShell";
import MePortfolio from "@/design/app/MePortfolio";

export const metadata = { title: "Profile · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MePortfolio">
      <MePortfolio />
    </AppShell>
  );
}
