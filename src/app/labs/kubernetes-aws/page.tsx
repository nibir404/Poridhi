import MarketingShell from "@/components/marketing/MarketingShell";
import StickyPid from "@/components/marketing/StickyPid";
import LabGroupDesign from "@/design/LabGroupDesign";

export const metadata = { title: "Kubernetes & AWS for DevOps labs · Poridhi" };

export default function Page() {
  return (
    <MarketingShell extra={<StickyPid pid="344-0" />}>
      <LabGroupDesign />
    </MarketingShell>
  );
}
