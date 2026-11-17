import MarketingShell from "@/components/marketing/MarketingShell";
import LabFilters from "@/components/marketing/LabFilters";
import LabLibraryDesign from "@/design/LabLibraryDesign";

export const metadata = { title: "Lab library · Poridhi" };

export default function Page() {
  return (
    <MarketingShell extra={<LabFilters />}>
      <LabLibraryDesign />
    </MarketingShell>
  );
}
