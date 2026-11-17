import AppShell from "@/components/app/AppShell";
import MeCertificates from "@/design/app/MeCertificates";

export const metadata = { title: "Certificates · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeCertificates">
      <MeCertificates />
    </AppShell>
  );
}
