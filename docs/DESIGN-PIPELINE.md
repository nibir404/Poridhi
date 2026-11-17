# Design pipeline (Paper → code)

1. Export a board with the Paper MCP `get_jsx` tool. Save it as `design/app/<ID>-0.json` (large results are written to a tool-results file; copy that file in. `scripts/pull_jsx_from_transcript.py <transcript.jsonl> design/app <ids…>` recovers inline results).
2. Add the board to `design/app-manifest.json` with `id`, `name` (component name), `route` and `title`.
3. Run `python3 scripts/build_app.py`. It generates `src/design/app/<Name>.tsx` and `src/app/<route>/page.tsx` wrapped in `AppShell`.
4. Add any screen-specific links to `SCREEN_LINKS` and behaviour to `behaviours.ts`.

The converter (`scripts/paper2tsx.py`) rewrites ids to `data-pid`, downloads assets to `public/`, fixes JSX attributes and maps weight 700 to 600 (semibold). Do not hand-edit generated layout: change the design and re-export.
