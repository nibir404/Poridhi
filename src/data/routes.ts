import { track } from "./roadmap";

/** Track overview: every milestone and module opens the roadmap explorer focused on it. */
function roadmapAllLinks(): Record<string, string> {
  const out: Record<string, string> = { "Open milestone 1": "/app/roadmap/milestone-1?ms=1" };
  track.milestones.forEach((ms) => {
    out[ms.title] = `/app/roadmap/milestone-1?ms=${ms.n}`;
    ms.modules.forEach((m) => (out[m.title] = `/app/roadmap/milestone-1?ms=${ms.n}&mod=${m.slug}`));
  });
  return out;
}

/** Visible label in the design → route. Shared by every app screen. */
export const APP_LINKS: Record<string, string> = {
  // App bar
  Home: "/app",
  Learn: "/app/roadmap",
  Labs: "/labs",
  Practice: "/app/practice",
  Me: "/app/me",
  // Auth & onboarding
  "Continue with Google": "/onboarding/goal",
  "Continue with GitHub": "/onboarding/goal",
  "Email me a sign-in link": "/signin/check-email",
  "Use a different email": "/signin",
  "Start free": "/welcome",
  "Start 7-day trial": "/welcome",
  "Go to dashboard": "/app",
  // Dashboard
  "Open roadmap": "/app/roadmap",
  "Get help": "/app/me/support",
  "Resume lab": "/app/lab",
  "Launch lab": "/app/lab",
  "Read guide": "/labs/guide/expose-docker-lb",
  // Profile sidebar
  Profile: "/app/me",
  "Time bank & coins": "/app/me/time-bank",
  Certificates: "/app/me/certificates",
  Subscription: "/app/me/subscription",
  Settings: "/app/me/settings",
  Progress: "/app/me/progress",
  "Lab history": "/app/me/lab-history",
  Notes: "/app/me/notes",
  Schedule: "/app/me/schedule",
  Support: "/app/me/support",
  Support1: "/app/me/support",
  "Sign out": "/signin",
  "Edit profile": "/app/me/edit",
  Cancel: "/app/me",
  "Save changes": "/app/me",
  "Book a TA": "/app/me/support/book",
  // Course
  Overview: "/app/course",
  Roadmap: "/app/course/roadmap",
  Instructors: "/app/course/instructors",
  FAQ: "/app/course/faq",
  "Check answer": "/app/learn/check/result",
  // Lab
  "Start lab": "/app/lab",
  "Check my work": "/app/lab/complete",
  // Exam & interview
  "Start exam": "/app/exam/questions",
  "Submit exam": "/app/exam/result",
  "Finish exam": "/app/exam/q4/finish",
  "Start interview": "/app/interview/session",
  "End interview": "/app/interview/feedback",
  "View full report": "/app/interview/report",
  // App bar chips and common actions
  Leaderboard: "/app/leaderboard",
  Instructions: "/app/exam/q4/instructions", Question: "/app/exam/q4/whiteboard", "main.tf": "/app/practice/exam", "default.conf": "/app/lab/ide",
  "Finish interview": "/app/interview/report", Client: "/app/interview/session", "staging-cluster": "/app/interview/terminal",
  "Ask a TA": "/app/me/support/book",
  "Report issue": "/app/me/support",
  "Back to roadmap": "/app/roadmap",
  "Update payment method": "/app/me/subscription",
  "+7 more modules": "/app/roadmap/milestone-1", "+2 more modules": "/app/roadmap/milestone-1", "+11 more modules": "/app/roadmap/milestone-1",
  "+1 more module": "/app/roadmap/milestone-1", "+3 more modules": "/app/roadmap/milestone-1", "+16 more modules": "/app/roadmap/milestone-1",
  "DEVOPS & CLOUD TRACK": "/app/course",
  "Publish nginx through the LB": "/app/lab",
  "M1 exam passed": "/app/exam/result",
  "20:00 Live · Debugging DNS": "/app/learn/live", "20:00 Live · Volumes Q&A": "/app/learn/live", "20:00 Live · K8s services": "/app/learn/live", "20:00 Live · Ingress": "/app/learn/live",
  "19:00 TA · Michael": "/app/me/support/book", "14:00 TA · Michael": "/app/me/support/book",
  "Term 1···": "/app/lab", "Term 2": "/app/lab", ":8080": "/app/lab/expose", "66dbf3.lb.poridhi.io": "/app/lab/expose",
  "+ Terminal": "/app/lab", "+ MongoDB": "/app/lab/database", "+ Redis": "/app/lab/database", "+ Expose port": "/app/lab/expose",
  "+180 this week": "/app/me/time-bank", "7RAYou · up 31,240": "/app/leaderboard", "7RAYou · up 3 1,240": "/app/leaderboard",
};

/**
 * Per-screen links: same label can mean different things on different screens
 * ("Continue", "Next step →"). Checked before APP_LINKS. Keys are AppShell screen names.
 */
export const SCREEN_LINKS: Record<string, Record<string, string>> = {
  AuthGoal: { "Not sure yet — show me everything": "/onboarding/level", Continue: "/onboarding/level" },
  AuthLevel: { Continue: "/onboarding/plan" },
  Dashboard: {
    "Persist Postgres with volumes": "/app/lab/launch", "Networking quick check": "/app/learn/check", "Explain Docker volumes": "/app/interview",
    "Lab time bank2h 40m": "/app/me/time-bank", "Streak12 days": "/app/me/progress",
    "Labs passed142+9 this week": "/app/me/lab-history", MON17: "/app/me/schedule", TUE18: "/app/me/schedule",
  },
  RoadmapAll: roadmapAllLinks(),

  RoadmapMilestone: {
    Continue: "/app/lab", "×": "/app/roadmap", "Docker networking & storage2/7": "/app/learn/class?m=docker-networking-and-storage",
    "Linux fundamentals12 / 12 · done": "/app/course", "Network namespaces10 items · ~4 h": "/app/learn/class",
    "Milestone 1 · 23 modules": "/app/course", "+ 16 more modules": "/app/course/roadmap",
  },
  LabLaunch: { "Launch lab": "/app/lab", Terminal: "/app/lab", "VS Code": "/app/lab", "Load balancer": "/app/lab", "Cloud tray": "/app/lab" },
  LabBoot: { "← Previous": "/app/lab/launch", "Next step →": "/app/lab" },
  LabRunning: { "← Previous": "/app/lab/launch", "Next step →": "/app/lab/complete", "IDE···": "/app/lab/ide", "Retarget LB to :8080": "/app/lab/expose", "Open raw response": "/app/lab/expose" },
  LabTimeLow: { "← Previous": "/app/lab", "Next step →": "/app/lab/complete", "+15 min from bank": "/app/lab", "+30": "/app/lab", Later: "/app/lab", Resume: "/app/lab" },
  LabComplete: { "← Previous": "/app/lab", "Next lab →": "/app/lab/launch", Continue: "/app/learn/check", "Keep VM running": "/app/lab", "End & save time": "/app/me/lab-history" },
  CourseOverview: { "Continue learning": "/app/learn/class", "Start course free": "/app/learn/class", "Start course": "/app/learn/class" },
  ClassRecorded: { "Mark complete": "/app/learn/check", "Start check": "/app/learn/check" },
  ClassLive: { "Join class": "/app/learn/class", "Mark complete": "/app/learn/check", "Go Pro": "/app/learn/gate" },
  QuickCheckResult: { "Next: Publish nginx lab →": "/app/lab/launch", "Retry check": "/app/learn/check" },
  GatePro: { "Go Pro · ৳1,500 / month": "/app/me/subscription", "Start check": "/app/learn/check", "Mark complete": "/app/learn/check" },
  GateLocked: { "Start check": "/app/learn/gate", "Mark complete": "/app/learn/gate" },
  ModuleComplete: { "Start Module 4": "/app/learn/class", "3 / 7Modules to exam": "/app/exam", "+30Coins": "/app/me/time-bank" },
  MilestoneComplete: { "Download PDF": "/app/me/certificates", "Share on LinkedIn": "/u/rahim", "● +300 coins": "/app/me/time-bank", "Rank · Engineer": "/app/leaderboard" },
  ExamIntro: { "See questions": "/app/exam/questions" },
  ExamQuestions: { Terraform: "/app/exam/q4/instructions", AWS: "/app/exam/q4/instructions", ELB: "/app/exam/q4/instructions", Ansible: "/app/exam/q4/instructions", CloudFormation: "/app/exam/q4/instructions", "Resume · 9:12": "/app/exam/q4/instructions", Start: "/app/exam/q4/instructions", Retry: "/app/exam/q4/instructions", "Finish exam": "/app/exam/q4/finish" },
  ExamInstructions: { "Submit Q4": "/app/exam/q4/submit", "All questions": "/app/exam/questions" },
  ExamWhiteboard: { "Submit Q4": "/app/exam/q4/submit", "All questions": "/app/exam/questions" },
  ExamSubmit: { "Keep working": "/app/exam/q4/whiteboard", "Save and submit": "/app/exam/q4/review", "All questions": "/app/exam/questions" },
  ExamState2: { "Retry Q4": "/app/exam/q4/instructions", "Next: Q5": "/app/exam/q4/finish", "All questions": "/app/exam/questions" },
  ExamState1: { "Keep going": "/app/exam/questions", "Finish attempt": "/app/exam/result", "All questions": "/app/exam/questions" },
  ExamPassed: { "View certificate": "/app/me/certificates", "Back to course": "/app/course" },
  ExamFailed: { "Retry exam": "/app/exam", "Review weak spots": "/app/course" },
  ExamIDE: { "Submit Q4": "/app/exam/q4/submit", "All questions": "/app/exam/questions" },
  InterviewIntro: { "Test microphone": "/app/interview/session" },
  InterviewWhiteboard: { "Finish interview": "/app/interview/feedback", Pause: "/app/interview/error" },
  InterviewFeedback: { "Next question": "/app/interview/terminal", "Try again": "/app/interview/session", "Finish interview": "/app/interview/report" },
  InterviewTerminal: { "Finish interview": "/app/interview/report" },
  InterviewError: { "Retry scoring": "/app/interview/feedback", "Score later, keep going": "/app/interview/terminal", "Finish interview": "/app/interview/report" },
  InterviewVoice: { Pause: "/app/interview/error", "Finish interview": "/app/interview/report", "Stop and send": "/app/interview/feedback", Restart: "/app/interview/session" },
  InterviewReport: {
    "Retry weakest stage": "/app/interview/session", "Back to course": "/app/course",
    "Caching at scale28 min": "/app/learn/class", "Lab: Redis cluster failover~40 min": "/app/lab/launch",
  },
  MePortfolio: {
    Edit: "/app/me/edit", "Share public profile": "/u/rahim", "142Labs passed": "/app/me/lab-history",
    "2Milestone certificates": "/app/me/certificates", "Lean hireBest AI interview signal": "/app/interview/report", "96 hHands-on time in VMs": "/app/me/time-bank",
  },
  MeSubscription: { "Change plan": "/pricing" },
  MeLabHistory: { Resume: "/app/lab", Retry: "/app/lab/launch" },
  MeProgress: { "DevOps & Cloud Engineer": "/app/course" },
  MeSupport: { "Send ticket": "/app/me/support/book", Tickets: "/app/me/support", "Book a TA": "/app/me/support/book" },
  MeSupportBook: { "Book session": "/app/me/support/rate", Tickets: "/app/me/support", "Book a TA": "/app/me/support/book" },
  MeSupportRate: { "Send feedback": "/app/me/support", Later: "/app/me/support", Tickets: "/app/me/support", "Book a TA": "/app/me/support/book" },
  MeCertificates: { PDF: "/u/rahim", Share: "/u/rahim" },
  MeEditProfile: { Cancel: "/app/me", "Save changes": "/app/me" },

  // Lab side panels: back to the running lab, forward to the completion check.
  LabCloudTray: { "← Previous": "/app/lab", "Next step →": "/app/lab/complete" },
  LabExposePort: { "← Previous": "/app/lab", "Next step →": "/app/lab/complete", Cancel: "/app/lab/expose", Remove: "/app/lab", "Expose port 8080": "/app/lab/complete" },
  LabDatabase: { "← Previous": "/app/lab", "Next step →": "/app/lab/complete", "+ Server": "/app/lab/machines", "MongoDB 8.0Launch": "/app/lab/machines", "Redis 7.0Launch": "/app/lab/machines" },
  LabIde: { "← Previous": "/app/lab", "Next step →": "/app/lab/complete", "Open Expose port": "/app/lab/expose", "Show command": "/app/lab" },
  LabMachines: { "← Previous": "/app/lab", "Next step →": "/app/lab/complete" },
  LabMenu: { "← Previous": "/app/lab", "Next step →": "/app/lab/complete", "Pause instead": "/app/lab", Cancel: "/app/lab", "End lab": "/app/lab/complete", "End & save time": "/app/me/lab-history" },
  LabFiles: { "← Previous": "/app/lab", "Next step →": "/app/lab/complete" },
  LabResources: { "← Previous": "/app/lab", "Next step →": "/app/lab/complete", Add: "/app/lab/database" },
  LabCredentials: { "← Previous": "/app/lab", "Next step →": "/app/lab/complete" },
  LabInfo: { "← Previous": "/app/lab", "Next step →": "/app/lab/complete" },
  ClassNoteEdit: { "Mark complete": "/app/learn/check", "Start check": "/app/learn/check", "Save note ⌘↵": "/app/learn/class/notes" },
  ClassNotes: { "Mark complete": "/app/learn/check", "Start check": "/app/learn/check", "Note at 09:42": "/app/learn/class", "Run in lab ▸": "/app/lab/launch", Done: "/app/learn/class" },
  CourseRoadmap: { "Open full canvas": "/app/roadmap" },
  CourseFaq: { "Ask a question": "/app/me/support" },
};
