# Changelog

All notable changes to this project are documented here. The format follows Keep a Changelog and the project uses semantic versioning.

## [1.9.0] - 2026-11-17

### Added
- Time bank and streak flows from the app-bar chips: the bank popover explains how VM time works, how to earn it and shows recent activity; the streak popover shows this week, the next reward and streak freezes. Both link onward (time bank, progress, keep going).
- Redeem flow: every "Redeem" action opens a dialog to turn coins into lab time (500-coin steps, 1,000 coins = 2 h) with a preview, confirmation and success state. Coins and bank figures update everywhere and persist across pages (`src/data/wallet.ts`).
- Logo goes to the landing page from every screen (app bar, phone top bar).

### Changed
- One icon style everywhere: round caps and joins, optical stroke widths by size (2 px at 12–14 px, 1.8 px above).
- Dark mode draws thin progress bars and meters in the bright accent so they stay visible.

### Fixed
- Marketing header turning white while scrolling in dark mode; the frosted bar now uses the theme background.

## [1.8.0] - 2026-11-17

### Added
- App bar and side columns (profile sidebar, lab rail and guide, class lists) stay in place while the page scrolls.
- Lab top bar text is clickable: breadcrumb and title open the roadmap at this lab, progress opens the completion check, the timer opens the time panel.

### Changed
- Light mode recolours the design's dark work areas too (lab workspace, tab strip, preview panel, console), so the light theme is light throughout; gradient art and media keep their colours.

### Fixed
- Green check circles and other coloured icons no longer turned black from the icon contrast check (coloured graphics are only adjusted when nearly invisible).

## [1.7.0] - 2026-11-17

### Added
- Lab, AI exam and AI interview screens are clickable end to end: every icon button is routed by its icon (lab top bar: machines, expose port, cloud tray, end lab, info; topology nodes; new tab; layout; exam: instructions, code, terminal, whiteboard, previous/next; interview: back, next stage, AI hint, mic), whiteboard tools toggle as a group, and dialog actions (Cancel, Remove, Expose port, End lab) go to the right state. Exam Question / Instructions tabs and file tabs link too.
- Contrast guard covers icons (3:1 against their real background) in every theme.

### Fixed
- Home hero going blank in the Windows 98 theme when the product preview switched tabs: theme changes now restore only the colours they set, never animation state.

## [1.6.0] - 2026-11-17

### Added
- Roadmap explorer (`/app/roadmap/milestone-1`): left bar (milestones → modules → items), a canvas you can drag, scroll and zoom like a design canvas (Fit, Jump to me, zoom buttons, item filters, Hide done), and a right panel with the story and outcomes of the selected milestone or module, or the details, checks and next step of the selected item. Canvas, left bar and panel stay in sync and the selection is kept in the URL (`?ms`, `?mod`, `?item`). Native light, dark and Windows 98 colours from the design-system tokens.
- Roadmap seed data (`src/data/roadmap.ts`): 6 milestones and 42 modules, each with a story and outcomes, plus items (class, reading, lab, quiz, AI interview, exam) with status and routes.
- Track overview: every milestone and module opens the explorer focused on it.
- Avatar menu in the app bar: Dashboard, Account, Settings, Log out.
- Notes: course and module filters, search across all notes, pick a note to preview, play / edit / delete, sort, Export .md.
- Routes for the app-bar time bank and streak chips and every remaining action found by the button audit (lab tabs and tools, schedule events, lab history, marketing Launch / Learn more / Verify, and more); Copy / Copy link / Reveal buttons work.

### Changed
- Fonts come from the Puku design system's assets (Matter and TX-02, variable woff2).
- App screens fill the window height instead of stopping at the design's 960px.
- Dark mode recolours areas the design draws dark too (sidebars, selected rows), keeps media and the lab console; borders use the quiet design-system border; dotted canvas grids are toned down.
- Windows 98 theme shows the logo with a white wordmark on the title bar.

### Fixed
- Rank badges and coins keep their own colours in every theme.

## [1.5.0] - 2026-11-17

### Changed
- Terminal theme is now a Windows 98 desktop: teal desktop, silver bevelled windows and cards, raised buttons, sunken fields, navy gradient title bars, square corners, Tahoma text, black console in the lab. Built by redefining the design-system variables, so search, menus and phone bars follow.

### Added
- Contrast guard: after any theme is applied, every text is checked against its real background and lifted to the most readable colour if it falls below WCAG AA (4.5:1, 3:1 for large text).
- Colour parsing handles modern CSS colours (oklch, color-mix), so the recolour and guard read design-system values correctly.
- Screens swapped in after load (the rotating product preview) are recoloured and checked too.

### Verified
- Contrast audit of 15 screens (marketing and app) in all three themes: 0 texts below WCAG AA.

## [1.4.0] - 2026-11-17

### Changed
- The Puku design system (`@puku` registry, ds.puku.sh) is the source of truth for theme tokens: `src/styles/puku-tokens.css` is pulled from the registry and the app's `--color-*`, the runtime recolour, overlays and phone bars all read its `--dashboard-*` variables.
- Accent follows the design system: indigo with near-white ink in light, lavender with navy ink in dark (fills and the text on them).
- Status colours (success, warning, danger) use the design system's tokens for readable contrast in both modes.
- Panels use the design system's 12px panel radius; controls keep 6px.
- Mono type: TX-02 (licensed, not committed), falling back to Geist Mono.

### Added
- `components.json` with the `@puku` registry and `.mcp.json` for the design-system MCP; both read `PUKUSH_ACCESS_TOKEN` from the environment (set it in `.env.local`, never commit it).

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
