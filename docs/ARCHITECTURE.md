# Architecture

## Rendering

Every screen is a Paper artboard exported to a React component under `src/design/`. Routes in `src/app/` wrap that component in a shell:

- **MarketingShell** (1440px artboards): nav links, Explore mega menu, ⌘K search, section reveal, card motion, theme switch in the nav. Page-specific behaviour is passed through the `extra` prop (hero shader, labs filters, sticky sidebars).
- **AppShell** (1600px artboards): turns visible labels into links, makes option cards behave as radio groups, opens search from the app bar, runs per-screen behaviours, hides design annotations ("STATE · …"), applies themes and the lab terminal treatment.

`DesignFrame` has three modes: full width above the design width (layers that span the artboard stretch to 100%), uniform CSS `zoom` between 1024px and the design width, and reflow below 1024px (`reflow.ts` loosens fixed widths, stacks or grids overflowing rows). `MobileChrome` adds the phone top bar and bottom tabs. Native `position: sticky` does not work under zoom, so sticky sidebars use `stickyIn` (a transform-based sticky).

## Links

Elements are found by their Paper layer id (`data-pid`) or their visible text. `src/data/routes.ts` holds:

- `APP_LINKS`: label → route, used on every app screen.
- `SCREEN_LINKS`: per screen overrides, for labels that mean different things on different screens ("Continue", "Next step →").

## Behaviours and seed data

`src/components/app/behaviours.ts` holds per-screen interaction (OTP typing, timers, greeting by time of day, lab boot auto-advance). `src/data/seed.ts` and `src/data/catalog.ts` hold the seed student, catalog and search data.

## Themes

`src/components/theme/` keeps the theme in `localStorage` (`pd-theme`) and on `<html data-theme>`. A small inline script in the root layout applies it before paint. `recolor.ts` maps the design's computed colours to the theme palette (page, card, inset, line, three text levels), skipping areas the design draws dark; CSS variable overrides in `globals.css` theme everything drawn with tokens (search, menus, phone bars). Lab terminal panels (`.pd-term`) are drawn light in light mode and as designed in dark modes. `soften.ts` tones pure-black fills down to lavender chips or navy panels.
