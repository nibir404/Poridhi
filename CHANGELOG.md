# Changelog

All notable changes to this project are documented here. The format follows Keep a Changelog and the project uses semantic versioning.

## [1.0.0] - 2026-11-17

### Added
- Marketing site built 1:1 from Paper: home (hero shader, platform showcase), labs library with sticky working filters, lab group and lab guide pages with sticky sidebars, courses, course detail, pricing, leaderboard, public profile, Explore menu and ⌘K search.
- Student app, 69 screens with seed data: sign-in and onboarding, dashboard, roadmap and milestone, course (overview, roadmap, instructors, FAQ), recorded and live classes, notes, quick check and result, Pro gate and locked states, module and milestone completion, cloud lab (launch, boot, running, IDE, files, machines, cloud tray, expose port, database, credentials, resources, info, low time, complete), AI interview (intro, session, feedback, terminal stage, error, report), AI exam (intro, questions, instructions, whiteboard, submit, review, finish, passed, failed), profile (portfolio, edit, time bank and coins, certificates, subscription, settings, progress, lab history, notes, schedule, support, book a TA, rate).
- Screen-to-screen navigation for the whole student flow (`APP_LINKS`, `SCREEN_LINKS`).
- Light, dark and terminal themes on every page, switched from the header; lab terminal follows the theme.
- Docs: architecture, flows, design pipeline, releasing.

### Changed
- Semibold (600) instead of bold everywhere; home hero heading 52px.

### Removed
- Hero floating cards and the cursor spotlight effect.
