import AppShell from "@/components/app/AppShell";
import LeaderboardDesign from "@/design/LeaderboardDesign";

export const metadata = { title: "Leaderboard · Poridhi" };

/** The leaderboard is for signed-in learners: it lives in the app, under the app header. */
export default function Page() {
  return (
    <AppShell screen="Leaderboard" width={1440}>
      <LeaderboardDesign />
    </AppShell>
  );
}
