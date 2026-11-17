import { redirect } from "next/navigation";

/** The leaderboard moved behind sign-in; keep the old address working. */
export default function Page() {
  redirect("/app/leaderboard");
}
