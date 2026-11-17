# Screens and flows

Generated from `design/app-manifest.json` and `src/data/routes.ts`. Global links (app bar, profile sidebar, common buttons) live in `APP_LINKS`; screen-specific buttons are listed below. The track overview links every milestone and module into the roadmap explorer (`roadmapAllLinks`).

| Screen | Route | Buttons → destination |
|---|---|---|
| Sign in | `/signin` | global links only |
| Check your email | `/signin/check-email` | global links only |
| Your goal | `/onboarding/goal` | Not sure yet — show me everything → `/onboarding/level`<br>Continue → `/onboarding/level` |
| Your level | `/onboarding/level` | Continue → `/onboarding/plan` |
| Choose a plan | `/onboarding/plan` | global links only |
| Welcome | `/welcome` | global links only |
| Dashboard | `/app` | Persist Postgres with volumes → `/app/lab/launch`<br>Networking quick check → `/app/learn/check`<br>Explain Docker volumes → `/app/interview`<br>Lab time bank2h 40m → `/app/me/time-bank`<br>Streak12 days → `/app/me/progress`<br>Labs passed142+9 this week → `/app/me/lab-history`<br>MON17 → `/app/me/schedule`<br>TUE18 → `/app/me/schedule` |
| Roadmap | `/app/roadmap` | global links only |
| Roadmap | `/app/roadmap/milestone-1` | Continue → `/app/lab`<br>× → `/app/roadmap`<br>Docker networking & storage2/7 → `/app/learn/class?m=docker-networking-and-storage`<br>Linux fundamentals12 / 12 · done → `/app/course`<br>Network namespaces10 items · ~4 h → `/app/learn/class`<br>Milestone 1 · 23 modules → `/app/course`<br>+ 16 more modules → `/app/course/roadmap` |
| Lab | `/app/lab` | ← Previous → `/app/lab/launch`<br>Next step → → `/app/lab/complete`<br>IDE··· → `/app/lab/ide`<br>Retarget LB to :8080 → `/app/lab/expose`<br>Open raw response → `/app/lab/expose` |
| AI interview | `/app/practice/interview` | Pause → `/app/interview/error`<br>Finish interview → `/app/interview/report`<br>Stop and send → `/app/interview/feedback`<br>Restart → `/app/interview/session` |
| AI exam | `/app/practice/exam` | Submit Q4 → `/app/exam/q4/submit`<br>All questions → `/app/exam/questions` |
| Launch lab | `/app/lab/launch` | Launch lab → `/app/lab/boot`<br>Terminal → `/app/lab/boot`<br>VS Code → `/app/lab/ide`<br>Load balancer → `/app/lab/expose`<br>Cloud tray → `/app/lab/cloud-tray` |
| Starting lab | `/app/lab/boot` | ← Previous → `/app/lab/launch`<br>Next step → → `/app/lab` |
| Add resource | `/app/lab/cloud-tray` | ← Previous → `/app/lab`<br>Next step → → `/app/lab/complete` |
| Expose a port | `/app/lab/expose` | ← Previous → `/app/lab`<br>Next step → → `/app/lab/complete` |
| Database | `/app/lab/database` | ← Previous → `/app/lab`<br>Next step → → `/app/lab/complete`<br>+ Server → `/app/lab/machines`<br>MongoDB 8.0Launch → `/app/lab/machines`<br>Redis 7.0Launch → `/app/lab/machines` |
| IDE + Puku CLI | `/app/lab/ide` | ← Previous → `/app/lab`<br>Next step → → `/app/lab/complete`<br>Open Expose port → `/app/lab/expose`<br>Show command → `/app/lab` |
| Machines & access | `/app/lab/machines` | ← Previous → `/app/lab`<br>Next step → → `/app/lab/complete` |
| Lab menu | `/app/lab/menu` | ← Previous → `/app/lab`<br>Next step → → `/app/lab/complete`<br>Pause instead → `/app/lab` |
| Time running low | `/app/lab/time` | ← Previous → `/app/lab`<br>Next step → → `/app/lab/complete`<br>+15 min from bank → `/app/lab`<br>+30 → `/app/lab`<br>Later → `/app/lab`<br>Resume → `/app/lab` |
| Lab complete | `/app/lab/complete` | ← Previous → `/app/lab`<br>Next lab → → `/app/lab/launch`<br>Continue → `/app/learn/check`<br>Keep VM running → `/app/lab`<br>End & save time → `/app/me/lab-history` |
| Files | `/app/lab/files` | ← Previous → `/app/lab`<br>Next step → → `/app/lab/complete` |
| Resources | `/app/lab/resources` | ← Previous → `/app/lab`<br>Next step → → `/app/lab/complete`<br>Add → `/app/lab/database` |
| Credentials | `/app/lab/credentials` | ← Previous → `/app/lab`<br>Next step → → `/app/lab/complete` |
| Lab info | `/app/lab/info` | ← Previous → `/app/lab`<br>Next step → → `/app/lab/complete` |
| Course overview | `/app/course` | Continue learning → `/app/learn/class`<br>Start course free → `/app/learn/class`<br>Start course → `/app/learn/class` |
| Course roadmap | `/app/course/roadmap` | Open full canvas → `/app/roadmap` |
| Instructors | `/app/course/instructors` | global links only |
| FAQ | `/app/course/faq` | Ask a question → `/app/me/support` |
| Recorded class | `/app/learn/class` | Mark complete → `/app/learn/check`<br>Start check → `/app/learn/check` |
| Add note | `/app/learn/class/note` | Mark complete → `/app/learn/check`<br>Start check → `/app/learn/check`<br>Save note ⌘↵ → `/app/learn/class/notes` |
| My notes | `/app/learn/class/notes` | Mark complete → `/app/learn/check`<br>Start check → `/app/learn/check`<br>Note at 09:42 → `/app/learn/class`<br>Run in lab ▸ → `/app/lab/launch`<br>Done → `/app/learn/class` |
| Live class | `/app/learn/live` | Join class → `/app/learn/class`<br>Mark complete → `/app/learn/check`<br>Go Pro → `/app/learn/gate` |
| Quick check | `/app/learn/check` | global links only |
| Quick check result | `/app/learn/check/result` | Next: Publish nginx lab → → `/app/lab/launch`<br>Retry check → `/app/learn/check` |
| Pro gate | `/app/learn/gate` | Go Pro · ৳1,500 / month → `/app/me/subscription`<br>Start check → `/app/learn/check`<br>Mark complete → `/app/learn/check` |
| Locked | `/app/learn/locked` | Start check → `/app/learn/gate`<br>Mark complete → `/app/learn/gate` |
| Module complete | `/app/learn/module-complete` | Start Module 4 → `/app/learn/class`<br>3 / 7Modules to exam → `/app/exam`<br>+30Coins → `/app/me/time-bank` |
| Milestone complete | `/app/learn/milestone-complete` | Download PDF → `/app/me/certificates`<br>Share on LinkedIn → `/u/rahim`<br>● +300 coins → `/app/me/time-bank`<br>Rank · Engineer → `/leaderboard` |
| Milestone exam | `/app/exam` | See questions → `/app/exam/questions` |
| Exam questions | `/app/exam/questions` | Terraform → `/app/exam/q4/instructions`<br>AWS → `/app/exam/q4/instructions`<br>ELB → `/app/exam/q4/instructions`<br>Ansible → `/app/exam/q4/instructions`<br>CloudFormation → `/app/exam/q4/instructions`<br>Resume · 9:12 → `/app/exam/q4/instructions`<br>Start → `/app/exam/q4/instructions`<br>Retry → `/app/exam/q4/instructions`<br>Finish exam → `/app/exam/q4/finish` |
| Exam question | `/app/exam/q4/instructions` | Submit Q4 → `/app/exam/q4/submit`<br>All questions → `/app/exam/questions` |
| Exam whiteboard | `/app/exam/q4/whiteboard` | Submit Q4 → `/app/exam/q4/submit`<br>All questions → `/app/exam/questions` |
| Submit answer | `/app/exam/q4/submit` | Keep working → `/app/exam/q4/whiteboard`<br>Save and submit → `/app/exam/q4/review`<br>All questions → `/app/exam/questions` |
| Question result | `/app/exam/q4/review` | Retry Q4 → `/app/exam/q4/instructions`<br>Next: Q5 → `/app/exam/q4/finish`<br>All questions → `/app/exam/questions` |
| Finish exam | `/app/exam/q4/finish` | Keep going → `/app/exam/questions`<br>Finish attempt → `/app/exam/result`<br>All questions → `/app/exam/questions` |
| Exam passed | `/app/exam/result` | View certificate → `/app/me/certificates`<br>Back to course → `/app/course` |
| Exam not passed | `/app/exam/result/retry` | Retry exam → `/app/exam`<br>Review weak spots → `/app/course` |
| AI interview | `/app/interview` | Test microphone → `/app/interview/session` |
| Interview | `/app/interview/session` | Finish interview → `/app/interview/feedback`<br>Pause → `/app/interview/error` |
| Feedback | `/app/interview/feedback` | Next question → `/app/interview/terminal`<br>Try again → `/app/interview/session`<br>Finish interview → `/app/interview/report` |
| Interview terminal | `/app/interview/terminal` | Finish interview → `/app/interview/report` |
| Scoring error | `/app/interview/error` | Retry scoring → `/app/interview/feedback`<br>Score later, keep going → `/app/interview/terminal`<br>Finish interview → `/app/interview/report` |
| Interview report | `/app/interview/report` | Retry weakest stage → `/app/interview/session`<br>Back to course → `/app/course`<br>Caching at scale28 min → `/app/learn/class`<br>Lab: Redis cluster failover~40 min → `/app/lab/launch` |
| Profile | `/app/me` | Edit → `/app/me/edit`<br>Share public profile → `/u/rahim`<br>142Labs passed → `/app/me/lab-history`<br>2Milestone certificates → `/app/me/certificates`<br>Lean hireBest AI interview signal → `/app/interview/report`<br>96 hHands-on time in VMs → `/app/me/time-bank` |
| Time bank & coins | `/app/me/time-bank` | global links only |
| Certificates | `/app/me/certificates` | PDF → `/u/rahim`<br>Share → `/u/rahim` |
| Subscription | `/app/me/subscription` | Change plan → `/pricing` |
| Support | `/app/me/support` | Send ticket → `/app/me/support/book` |
| Book a TA | `/app/me/support/book` | Book session → `/app/me/support/rate` |
| Rate session | `/app/me/support/rate` | Send feedback → `/app/me/support`<br>Later → `/app/me/support` |
| Progress | `/app/me/progress` | DevOps & Cloud Engineer → `/app/course` |
| Lab history | `/app/me/lab-history` | Resume → `/app/lab`<br>Retry → `/app/lab/launch` |
| Schedule | `/app/me/schedule` | global links only |
| Settings | `/app/me/settings` | global links only |
| Edit profile | `/app/me/edit` | Cancel → `/app/me`<br>Save changes → `/app/me` |
| Notes | `/app/me/notes` | global links only |

## Automatic transitions

- Check email: the 6-digit code types itself, then continues to `/onboarding/goal`.
- Lab boot: after about 6 seconds the VM is ready and opens `/app/lab`.
