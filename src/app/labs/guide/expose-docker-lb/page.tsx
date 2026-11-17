import MarketingShell from "@/components/marketing/MarketingShell";
import StickyPid from "@/components/marketing/StickyPid";
import LabGuideDesign from "@/design/LabGuideDesign";

export const metadata = { title: "How to expose a Docker container with a load balancer · Poridhi" };

export default function Page() {
  return (
    <MarketingShell extra={<StickyPid pid={["2DM-0", "2EY-0"]} />}>
      <LabGuideDesign />
    </MarketingShell>
  );
}
