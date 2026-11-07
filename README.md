# LIFE.exe

**Another year. Another evolution.**

An anonymous interactive birthday experience disguised as a biological computing experiment. Explore a terminal, mutate a three-dimensional genome, awaken a neural field, and unlock the next iteration.

## Experience

- Procedural Three.js DNA, neural signals, and a particle birthday reveal.
- Mouse, touch-pointer, and keyboard-accessible button controls.
- Optional original synthesized audio; no autoplay sound.
- Reduced-motion support and an animated Canvas fallback.
- Replay and downloadable PNG artwork.
- No accounts, analytics, tracking, paid APIs, or external media services.

## Development

Requires Node.js 24 and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development server serves the experience at `/life-exe/`.

```sh
pnpm typecheck
pnpm test
pnpm build
node scripts/verify-pages.mjs
pnpm preview
```

The production output is `dist-pages/`. The Vite base is `/life-exe/`; JavaScript chunks, styles, and the favicon are built for that repository path. The graphics and audio are generated locally without downloaded models, textures, fonts, or recordings.

## Deployment

The GitHub Actions workflow checks types, tests geometry, builds the site, verifies its assets, and deploys the static artifact using official GitHub Pages actions. Deployments run on pushes to `main` and manual workflow dispatch. Pages uses the GitHub Actions publishing source.

## Source

- `components/life/` — the original approved experience, rendering, geometry, audio, and copy.
- `app/globals.css` — the original responsive visual design.
- `static-app/` — static HTML and React entry point.
- `vite.pages.config.ts` — GitHub Pages build configuration.
- `tests/` — deterministic geometry and connectivity checks.

Responsive Chromium testing does not establish physical Android, iPhone, or Telegram in-app browser compatibility. WebGL and PNG downloading depend on browser capabilities; the Canvas mode and button controls preserve the essential journey.
