#!/bin/sh
# Regenerate every marketing page component from the saved Paper JSX dumps.
cd "$(dirname "$0")/.."
for m in "home.json:HomeDesign" "1X9-0.json:CoursesDesign" "22O-0.jsx:CourseDetailDesign" "281-0.json:LabLibraryDesign" "32S-0.jsx:LabGroupDesign" "2CM-0.jsx:LabGuideDesign" "2GC-0.jsx:PricingDesign" "2M5-0.jsx:LeaderboardDesign" "2QK-0.json:PortfolioDesign" "1PN-0.jsx:ExploreOverlayDesign" "1U1-0.jsx:SearchOverlayDesign"; do
  f=${m%%:*}; n=${m##*:}
  python3 scripts/paper2tsx.py "design/jsx/$f" "$n" "src/design/$n.tsx"
done
