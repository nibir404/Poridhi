import AppShell from "@/components/app/AppShell";
import MeEditProfile from "@/design/app/MeEditProfile";

export const metadata = { title: "Edit profile · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="MeEditProfile">
      <MeEditProfile />
    </AppShell>
  );
}
