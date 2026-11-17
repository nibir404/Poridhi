import AppShell from "@/components/app/AppShell";
import MeSupportBook from "@/design/app/MeSupportBook";

export const metadata = { title: "Book a TA · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeSupportBook">
      <MeSupportBook />
    </AppShell>
  );
}
