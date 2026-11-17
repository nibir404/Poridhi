# Changelog

All notable changes to this project are documented here. The format follows Keep a Changelog and the project uses semantic versioning.

## [1.3.0] - 2026-11-17

### Changed
- Type: Matter (variable 300–800) everywhere, through `--font-sans`; design layers no longer name Helvetica Neue.
- Light and dark themes use the Puku palette (puku.sh): warm olive-grey page, panel, inset and border levels, olive-tinted text, indigo accent text. Light mode is now recoloured too, so both modes share one system.

### Security
- Next.js 15.5.4 → 15.5.29 (CVE-2025-66478; Vercel was blocking deploys).
- `overrides` pin patched postcss and sharp; `npm audit` reports 0 vulnerabilities.

### Fixed
- Active phone tab label readable in dark mode; short chips and numbers no longer wrap letter by letter on phones.

## [1.2.0] - 2026-11-17

### Added
- Seed entities behind buttons (`src/data/entities.ts`): 43 roadmap modules with their milestone and first lesson, 3 labs, 10 exam questions.
- Buttons carry the item they open (`?m=`, `?lab=`, `?q=`); the opened screen shows that item and keeps it through the flow (class → quick check, lab launch → running → complete, question → submit → result). See `src/components/app/context.ts`.
- Exam question rows each open their own question; passed ones open the result.
- Lab icon strip links to guide, files, cloud resources, credentials and info.

### Changed
- Readable page titles for sign-in, onboarding, dashboard, roadmap and exam screens.

## [1.1.0] - 2026-11-17

### Added
- Full-width layout on screens wider than the design; uniform scaling between 1024px and the design width.
- Phone app shell: compact top bar (logo or back button, search, theme), bottom tab bar, focus mode without tabs for the running lab, exam questions and live interview.
- Phone and tablet reflow: fluid widths, card rows become 2-column grids, wide rows stack, lab tool rail turns horizontal.
- Proper dark and terminal themes: runtime recolour with separate page, card and inset levels and readable text; areas the design draws dark (hero, lab terminal) keep their colours. Search, Explore menu and switches follow the theme.
- Topic icons for every search and Explore item.
- Links for every remaining button (lab panels, notes, roadmap modules, exam topics, FAQ, course roadmap).

### Changed
- Large black fills softened: small chips and selected rows use lavender, big panels the brand navy.
- Buttons and cards stay still on hover (no lift or magnetic movement).

### Fixed
- Entrance animations no longer get stuck half-way (staggered cards, flat dashboard chart).
- Duplicate theme switch in the marketing header.

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
