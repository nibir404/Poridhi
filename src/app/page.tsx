import MarketingShell from "@/components/marketing/MarketingShell";
import HomeDesign from "@/design/HomeDesign";
import HomeInteractions from "@/components/motion/HomeInteractions";

export default function Home() {
  return (
    <MarketingShell extra={<HomeInteractions />}>
      <HomeDesign />
    </MarketingShell>
  );
}
