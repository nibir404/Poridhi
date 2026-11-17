import MarketingShell from "@/components/marketing/MarketingShell";
import PricingDesign from "@/design/PricingDesign";

export const metadata = { title: "Pricing · Poridhi" };

export default function Page() {
  return (
    <MarketingShell>
      <PricingDesign />
    </MarketingShell>
  );
}
