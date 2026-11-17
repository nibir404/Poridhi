# Architecture

## Rendering

Every screen is a Paper artboard exported to a React component under `src/design/`. Routes in `src/app/` wrap that component in a shell:

- **MarketingShell** (1440px artboards): nav links, Explore mega menu, ⌘K search, section reveal, card motion, theme switch in the nav. Page-specific behaviour is passed through the `extra` prop (hero shader, labs filters, sticky sidebars).
- **AppShell** (1600px artboards): turns visible labels into links, makes option cards behave as radio groups, opens search from the app bar, runs per-screen behaviours, hides design annotations ("STATE · …"), applies themes and the lab terminal treatment.

`DesignFrame` renders the artboard at design width and scales it with CSS `zoom` to fit narrower viewports. Native `position: sticky` does not work under zoom, so sticky sidebars use `stickyIn` (a transform-based sticky).

## Links

Elements are found by their Paper layer id (`data-pid`) or their visible text. `src/data/routes.ts` holds:

- `APP_LINKS`: label → route, used on every app screen.
- `SCREEN_LINKS`: per screen overrides, for labels that mean different things on different screens ("Continue", "Next step →").

## Behaviours and seed data

`src/components/app/behaviours.ts` holds per-screen interaction (OTP typing, timers, greeting by time of day, lab boot auto-advance). `src/data/seed.ts` and `src/data/catalog.ts` hold the seed student, catalog and search data.

## Themes

`src/components/theme/` keeps the theme in `localStorage` (`pd-theme`) and on `<html data-theme>`. A small inline script in the root layout applies it before paint. Dark and terminal are colour-space flips of the design frame (`globals.css`); photos and canvases are flipped back, and lab terminal panels (`.pd-term`) are flipped so they stay light in light mode and dark in dark mode.
