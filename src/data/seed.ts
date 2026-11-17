/** Seed data for the logged-in experience. Screens read live values from here. */
export const seed = {
  user: { name: "Rahim Ahmed", first: "Rahim", email: "rahim@example.com", initials: "RA", rank: "Engineer", leaderboardRank: 7 },
  timeBank: { minutes: 160 },
  coins: 1240,
  xp: { current: 3000, nextRank: "Senior", next: 7500 },
  streakDays: 12,
  labsPassed: 142,
  currentLab: {
    title: "Publish nginx through the load balancer",
    milestone: 1, module: 3, step: 3, steps: 4, checksPassed: 2,
  },
  otp: "481920",
  onboarding: { goal: "DevOps & Cloud Engineer", level: "Some basics", hoursPerWeek: "5–8 h" },
};
export type Seed = typeof seed;
