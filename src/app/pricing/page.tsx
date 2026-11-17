import MarketingShell from "@/components/marketing/MarketingShell";
import PricingDesign from "@/design/PricingDesign";
import PricingToggle from "@/components/marketing/PricingToggle";

export const metadata = { title: "Pricing · Poridhi" };

export default function Page() {
  return (
    <MarketingShell>
      <PricingDesign />
      <PricingToggle />
    </MarketingShell>
  );
}
