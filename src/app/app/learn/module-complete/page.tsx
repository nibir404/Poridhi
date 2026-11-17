import AppShell from "@/components/app/AppShell";
import ModuleComplete from "@/design/app/ModuleComplete";

export const metadata = { title: "Module complete · Poridhi" };

export default function Page() {
  return (
    <AppShell screen="ModuleComplete">
      <ModuleComplete />
    </AppShell>
  );
}
