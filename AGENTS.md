# Agent Guidelines for qrcode.vue

This document provides guidelines for AI agents working on the qrcode.vue repository.
It includes build/test commands, code style conventions, and project-specific patterns.

## Build and Development Commands

The project uses npm scripts defined in `package.json`:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot reload (uses rsbuild) |
| `npm run build` | Build production bundles using Rollup (generates CommonJS, ES module, UMD) |
| `npm test` | Run all tests using rstest |
| `npm run test -- --testNamePattern="pattern"` | Run tests matching pattern (rstest filter) |
| `rstest test/index.test.ts` | Run a specific test file |

### Running a Single Test

To run a specific test or test file, use the rstest CLI directly:

```bash
# Run a specific test file
npx rstest test/index.test.ts

# Run tests matching a pattern (grep)
npx rstest --testNamePattern="renders SVG"

# Run with coverage (if configured)
npx rstest --coverage
```

### Type Checking

The project uses TypeScript with strict mode enabled. Type checking is performed during the Rollup build for ES modules only (configured in `rollup.config.js`). To manually check types:

```bash
npx tsc --noEmit
```

## Code Style Guidelines

### Indentation and Formatting

- **Indentation**: 2 spaces (no tabs) – enforced by `.editorconfig`
- **Line endings**: LF (Unix)
- **Trailing whitespace**: Trimmed
- **Final newline**: Yes (except for *.md files)

### TypeScript Conventions

- **Strict mode**: Always enabled (`strict: true` in tsconfig)
- **Type annotations**: Prefer explicit types for function parameters and return types
- **Interfaces vs Types**: Use `type` for simple aliases, `interface` for object shapes that may be extended (observe existing patterns)
- **Import style**: Use ES6 imports; group Vue imports first, then local imports

Example from `src/index.ts`:
```ts
import { defineComponent, Fragment, h, onMounted, onUpdated, PropType, ref } from 'vue'
import QR from './qrcodegen'
```

### Naming Conventions

- **Component names**: PascalCase (e.g., `QrcodeVue`, `QrcodeSvg`, `QrcodeCanvas`)
- **Variable/function names**: camelCase
- **Constants**: UPPER_SNAKE_CASE for true constants, otherwise camelCase
- **Type parameters**: Single uppercase letters (e.g., `T`, `U`)
- **Private fields**: No special prefix; TypeScript's `private` modifier or naming convention `_private` is not used

### Vue Component Patterns

- Use Composition API with `defineComponent`
- Props defined as objects with type annotations using `PropType`
- Reactive state managed with `ref` and `computed`
- Lifecycle hooks: `onMounted`, `onUpdated`, etc.
- Render function using `h()` (hyperscript) – no template DSL
- Component `name` property set to PascalCase string

Example prop definition:
```ts
const QRCodeProps = {
  value: {
    type: String,
    required: true,
    default: '',
  },
  size: {
    type: Number,
    default: 100,
  },
  // ...
}
```

### Error Handling

- Use `throw new RangeError` for invalid arguments (see `qrcodegen.ts`)
- Validate props with validator functions
- Graceful fallbacks for unsupported browser features (e.g., `Path2D` detection)

### Imports Order

1. Vue framework imports
2. Third‑party libraries
3. Local modules (relative paths)

### Semicolons

The codebase uses semicolons inconsistently. Follow the existing file's style:
- `qrcodegen.ts` uses semicolons consistently (legacy TypeScript/JavaScript)
- `index.ts` uses semicolons mostly for statements but not after function declarations

When in doubt, match the surrounding code.

## Testing

- Tests are written with `@rstest/core` and `@vue/test-utils`
- Test files are in `test/` directory with `.test.ts` extension
- Use `describe`/`it` pattern
- Mount components with `mount()` from `@vue/test-utils`
- Assertions use `expect()` from `@rstest/core`

Example test:
```ts
import { describe, expect, it } from '@rstest/core'
import { mount } from '@vue/test-utils'
import QrcodeVue from '../src'

describe('QrcodeVue', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(QrcodeVue, {
      props: { value: 'test' },
    })
    expect(wrapper.html()).toContain('<canvas')
  })
})
```

## Build Configuration

- **Rollup**: Bundles library for CommonJS, ES module, and UMD (see `rollup.config.js`)
- **Rsbuild**: Used for development and example building (see `rsbuild.config.js`)
- **TypeScript**: Configuration in `tsconfig.json` (minimal, strict)
- **No separate linting tool** (rely on TypeScript strict checks and editorconfig)

## Project Structure

```
src/
  index.ts          # Main Vue component (exports QrcodeVue, QrcodeSvg, QrcodeCanvas)
  qrcodegen.ts      # QR code generator library (external, minimally modified)
test/
  index.test.ts     # Component tests
example/            # Demo application
  webpack-entry.ts  # Entry point for dev server
  webpack.html      # HTML template
  styles.scss       # Demo styles
typings/            # TypeScript declarations
dist/               # Built artifacts (ignored in git)
```

## Quality Assurance

- After making changes, run `npm run build` to ensure the library builds successfully.
- Run `npm test` to ensure all tests pass.
- Consider running `npx tsc --noEmit` to verify TypeScript strictness.
- There are no Cursor (`/.cursor/`) or Copilot (`/.github/copilot-instructions.md`) rules in this repository.

## Notes for Agents

- This is a Vue 3 component library; ensure compatibility with Vue 3's API
- The QR code generator (`qrcodegen.ts`) is a third‑party library (Project Nayuki) – avoid modifications unless absolutely necessary
- The component supports both canvas and SVG rendering, with gradient and image overlay features
- When adding new props, maintain the existing prop definition pattern and include appropriate validators
- Ensure any changes work for both Vue 2 and Vue 3 (the library claims support for both, but check peerDependencies)

## Commit Guidelines

- Use conventional commit messages (feat, fix, chore, docs, test, etc.)
- Reference GitHub issues when applicable
- Keep commits focused; one logical change per commit

## Resources

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq)
- [Rollup documentation](https://rollupjs.org/)
- [rstest documentation](https://github.com/rsuite/rstest)
- [QR Code Generator Library](https://www.nayuki.io/page/qr-code-generator-library)

---
*This file was generated for agentic coding assistants. Update it as the project evolves.*