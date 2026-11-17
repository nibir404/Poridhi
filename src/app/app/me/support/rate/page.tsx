import AppShell from "@/components/app/AppShell";
import MeSupportRate from "@/design/app/MeSupportRate";

export const metadata = { title: "Rate session · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeSupportRate">
      <MeSupportRate />
    </AppShell>
  );
}
