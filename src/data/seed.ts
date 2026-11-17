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
  /** Time bank: VM minutes. Counts down only while a lab VM runs; refilled by passing milestones or redeeming coins. */
  bank: {
    rule: "VM time counts only while a lab is running. Reading, classes and quizzes are free.",
    earn: [
      { what: "Pass a milestone exam", gives: "+3 h" },
      { what: "Redeem 1,000 coins", gives: "+2 h" },
      { what: "Pro plan, every month", gives: "+20 h" },
    ],
    activity: [
      { when: "Today", what: "Lab · Publish nginx through the LB", delta: -38 },
      { when: "Yesterday", what: "Lab · Persist Postgres with volumes", delta: -35 },
      { when: "2 days ago", what: "Redeemed 1,000 coins", delta: 120 },
      { when: "5 days ago", what: "Lab · Bridge networks", delta: -22 },
      { when: "8 days ago", what: "Milestone 0 exam passed", delta: 180 },
    ],
  },
  /** Streak: days in a row with at least one finished item (class, lab, quiz). */
  streak: {
    best: 21,
    week: [
      { d: "Mon", done: true }, { d: "Tue", done: true }, { d: "Wed", done: true }, { d: "Thu", done: true },
      { d: "Fri", done: true }, { d: "Sat", done: true }, { d: "Sun", done: false, today: true },
    ],
    next: { at: 14, reward: "+50 coins" },
    freezes: 1,
    today: "Finish any item today to keep your streak.",
  },
  onboarding: { goal: "DevOps & Cloud Engineer", level: "Some basics", hoursPerWeek: "5–8 h" },
};
export type Seed = typeof seed;
