# Poridhi — web platform

The Poridhi learning platform: the marketing site (home, labs, courses, pricing, leaderboard, public profile) and the student app (onboarding, dashboard, roadmap, courses and classes, cloud labs, AI interview, AI exam, profile).

Every screen is built 1:1 from the Paper design file and runs on seed data, so the full student journey can be clicked through without a backend.

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, inline design styles generated from Paper |
| Motion | GSAP, Framer Motion, Lenis smooth scroll |
| 3D / shaders | three.js, React Three Fiber, drei |
| Font | Matter (licensed, see below), Geist Mono |

## Design system

Colours, radii and type come from the Puku design system (`@puku` registry at ds.puku.sh). Put your token in `.env.local`:

```bash
echo "PUKUSH_ACCESS_TOKEN=<your token>" >> .env.local
```

`components.json` registers `@puku` for the shadcn CLI and `.mcp.json` registers the design-system MCP; both read the token from the environment. Tokens live in `src/styles/puku-tokens.css` (pulled from the registry's `puku.css`).

## Font

Matter and TX-02 come from the Puku design system's assets (ds.puku.sh/assets). They are licensed, so they are not committed to this public repository: put `Matter.woff2` and `TX-02.woff2` in `public/fonts/`. Without them the site falls back to Helvetica Neue / system sans and Geist Mono.

## Getting started

Requires Node 20+.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. For a production build:

```bash
npm run build
```

```bash
npm start
```

## Walking the student flow

Start at `/signin` and follow the buttons. The main path is:

1. **Sign in** `/signin` → check email (code fills itself) → goal → level → plan → `/welcome`
2. **Dashboard** `/app` → roadmap `/app/roadmap` → roadmap explorer `/app/roadmap/milestone-1` (pick a milestone, a module, then an item; drag and zoom the canvas)
3. **Course** `/app/course` (Overview / Roadmap / Instructors / FAQ) → class `/app/learn/class` → quick check `/app/learn/check` → result → module complete → milestone complete
4. **Lab** `/app/lab/launch` → boot (advances on its own) → running lab `/app/lab` → check my work → `/app/lab/complete`
5. **AI interview** `/app/interview` → session → feedback → terminal stage → report
6. **AI exam** `/app/exam` → questions → Q4 instructions / whiteboard → submit → review → finish → result (passed or retry)
7. **Profile** `/app/me` → time bank, certificates, subscription, settings, progress, lab history, notes, schedule, support (ticket → book a TA → rate)

Locked and gated states are at `/app/learn/gate` (Pro upsell) and `/app/learn/locked`. Error and low-time states are at `/app/interview/error` and `/app/lab/time`.

See [docs/FLOWS.md](docs/FLOWS.md) for every screen, its route and where each button goes.

## Themes

Every page has a light, dark and terminal (Windows 98 style) theme, switched from the header (sign-in screens, which have no header, show the switch in the bottom-left corner; on phones it is in the top bar). The choice is saved in `localStorage` under `pd-theme`. Dark themes recolour the design at runtime with distinct page, card and inset levels (`src/components/theme/recolor.ts`). In the lab, the terminal is light in light mode and dark in dark and terminal modes. A contrast guard keeps every text at WCAG AA or better in all three themes.

## Layout on different screens

- **Wider than the design:** full width.
- **1024px to the design width:** the design scaled to fit.
- **Tablet and phone:** content reflows into a fluid column (`src/components/layout/reflow.ts`). On phones the site behaves like an app: a compact top bar and a bottom tab bar (`MobileChrome.tsx`); the running lab, exam questions and live interview open full screen with a back button.

## Project layout

```
design/                 Paper exports (JSX as JSON) + app-manifest.json (screen → route)
scripts/
  paper2tsx.py          Paper export → React component
  build_app.py          builds every app screen listed in design/app-manifest.json
  pull_jsx_from_transcript.py   recovers Paper exports saved in a session transcript
src/
  app/                  Next.js routes (marketing at /, student app under /app)
  design/               generated screens (do not hand-edit layout; regenerate instead)
  components/
    app/                AppShell (links, option groups, search, themes) + per-screen behaviours
    marketing/          MarketingShell, filters, sticky sidebars, platform showcase
    motion/             GSAP / Lenis helpers, hero interactions
    theme/              theme state + header switch
  data/
    routes.ts           APP_LINKS (global) and SCREEN_LINKS (per screen) → routes
    seed.ts, catalog.ts seed data used across screens
docs/                   architecture, flows, design pipeline, release process
```

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DESIGN-PIPELINE.md](docs/DESIGN-PIPELINE.md), [docs/RELEASING.md](docs/RELEASING.md), [CHANGELOG.md](CHANGELOG.md).

## Design rules

- Matter everywhere; semibold (600), never bold.
- Colours follow the Puku palette in light and dark.
- 6px corner radius; buttons at most 40px tall.
- Accent `#B0B3FC` only on action items.
- Rewards are **coins**, not points. Lab time counts only while the VM runs.

## Versioning

Semantic versioning, tagged `vMAJOR.MINOR.PATCH` on `main`. Changes are listed in [CHANGELOG.md](CHANGELOG.md).
