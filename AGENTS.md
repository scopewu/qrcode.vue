# AGENTS.md — qrcode.vue

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Generate i18n templates + rsbuild dev server (hot reload, serves `example/`) |
| `npm run build` | Library production build via Rollup → CJS + ESM + UMD (minified) into `dist/` |
| `npm run build:example` | Generate i18n templates + rsbuild build → `example/dist/` |
| `npm run generate:i18n` | Regenerate per-language HTML templates from `example/templates/base.html` |
| `npm test` | Run tests with rstest |

**CI uses yarn**, not npm (`yarn install && yarn build`). Both work locally.

### Single test / test pattern

```bash
npx rstest test/index.test.ts                  # specific file
npx rstest --testNamePattern="renders SVG"     # pattern match
```

### Type checking

TypeScript type-checking only runs during the ES module Rollup build (`rollup -c`). For a standalone check:

```bash
npx tsc --noEmit
```

`tsconfig.json` is minimal: `strict: true`, `moduleResolution: "bundler"`, `skipLibCheck: true`.

## Architecture

Single-file Vue 3 component library. No router, no store, no monorepo.

- **`src/index.ts`** — Everything: `QrcodeVue` (default export, switches canvas/svg), `QrcodeSvg`, `QrcodeCanvas`, shared props, `useQRCode()` composable, SVG path generators, exported types (`Level`, `RenderAs`, `GradientType`, `ImageSettings`)
- **`src/qrcodegen.ts`** — Third-party QR encoder (Project Nayuki). **Do not modify.**
- **`test/index.test.ts`** — All tests, single file. Uses `@rstest/core` + `@vue/test-utils` + `happy-dom`
- **`typings/index.d.ts`** — Vue SFC/CSS module shims (for example app, not the library)
- **`dist/`** — Library build output. 4 files: `.cjs.js`, `.esm.js`, `.browser.js`, `.browser.min.js`

### Library build gotchas

- Rollup produces **4 bundles** (CJS, ESM, UMD, UMD-minified). Only the ESM build runs type-checking and generates `.d.ts` declarations.
- A custom Rollup plugin (`cleanExtraDts`) deletes `dist/qrcodegen.d.ts` after build — don't be surprised.
- `vue` is **external** (peerDependency `^3.0.0`), never bundled.
- Package uses `"type": "module"` (ESM by default).

### Rendering approach

Components use **render functions with `h()`**, not `<template>` SFC syntax. All component logic lives in `setup()` with Composition API (`defineComponent`, `ref`, `computed`, `watchEffect`).

Two renderers:
- **Canvas** — draws via `CanvasRenderingContext2D` + `Path2D` (falls back to per-cell `fillRect` when `Path2D` unsupported)
- **SVG** — generates SVG path data strings, outputs `<svg>` with `<path>`, `<defs>` for gradients/clip-paths

## Example app (i18n)

Demo app with multi-language support (en, zh, zh-HK). Deployed to GitHub Pages on release.

### Architecture: SSG via template substitution

Build-time i18n — not client-side. A single HTML template gets translated into per-language HTML files before rsbuild processes them.

```
example/templates/base.html          ← single source-of-truth HTML with {{t('key')}} placeholders
example/i18n/{en,zh,zh-hk}.ts       ← translation files (default export, nested keys)
example/i18n/index.ts                ← LANGUAGES array, getLang(), t() (runtime, for LangSwitcher only)
example/scripts/generate-i18n.mjs    ← build script: template + translations → .generated/webpack.{lang}.html
example/.generated/                  ← gitignored output, regenerated on every dev/build
```

**Build flow**: `npx tsx generate-i18n.mjs` → `rsbuild build` (3 entry points mapped to generated templates)

**Adding a new language**: add translation file → add entry to `LANGUAGES` in `i18n/index.ts` → add entry in `rsbuild.config.js` → add config in `generate-i18n.mjs` `langConfig`.

### Key files

- **`example/webpack-entry.ts`** — App entry: mounts Vue app + `LangSwitcher` component
- **`example/styles.css`** — App styles including lang-dropdown
- **`rsbuild.config.js`** — 3 rsbuild entries (`index`, `zh/index`, `zh-hk/index`), all pointing to same JS entry but different HTML templates via `template({ entryName })`

### SEO

Each generated page includes: `<html lang>`, `hreflang` alternates, `canonical`, `og:locale`, `x-default`. LangSwitcher is runtime Vue — not part of SSG.

## Code Style

- 2-space indent, LF, no tabs (`.editorconfig`)
- No linter — TypeScript strict mode is the only enforcement
- **No semicolons** in `index.ts` (the main source). `qrcodegen.ts` uses semicolons (third-party, different style — don't change it)
- No `<template>` blocks — all rendering via `h()` hyperscript calls
- Props: plain objects with `PropType<T>` annotations and `validator` functions

## Testing

- Runner: `@rstest/core` (not Jest, not Vitest). API is `describe`/`it`/`expect` — familiar but the import is from `@rstest/core`.
- Environment: `happy-dom` (not jsdom)
- Mounting: `@vue/test-utils` `mount()`
- All tests in one file: `test/index.test.ts`
- Tests cover canvas mode, SVG mode, prop switching, gradients, image overlay, radius, accessibility, edge cases

## CI / Release

- **Publish**: triggered by `v*` tags → `yarn install && yarn build && npm publish --access public` (Node 24)
- **Demo deploy**: triggered by GitHub releases → `yarn install && yarn build:example` → deploys `example/dist/` to `gh-pages` branch

## What not to touch

- `src/qrcodegen.ts` — third-party Nayuki QR library, vendored as-is
- `example/dist/` — built artifacts, regenerated by rsbuild
- `example/.generated/` — build-time output, regenerated by `generate:i18n`
