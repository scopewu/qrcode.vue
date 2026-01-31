# Agent Guidelines for qrcode.vue

This document provides guidelines for AI agents working on the qrcode.vue repository.
It includes build/test commands, code style conventions, and project-specific patterns.

## Build and Development Commands

The project uses npm scripts defined in `package.json`:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot reload (rsbuild) |
| `npm run build` | Build production bundles using Rollup (CommonJS, ES module, UMD) |
| `npm test` | Run all tests using rstest |

### Running a Single Test

Use the rstest CLI directly:

```bash
# Run a specific test file
npx rstest test/index.test.ts

# Run tests matching a pattern
npx rstest --testNamePattern="renders SVG"
```

### Type Checking

TypeScript with strict mode enabled. Type checking runs during Rollup build (ES modules only). Manual check:

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

- **Strict mode**: Always enabled (`strict: true`)
- **Type annotations**: Prefer explicit types for function parameters and return types
- **Interfaces vs Types**: Use `type` for simple aliases, `interface` for extensible object shapes
- **Import style**: ES6 imports; group Vue imports first, then local imports

Example:
```ts
import { defineComponent, Fragment, h, PropType, ref } from 'vue'
import QR from './qrcodegen'
```

### Naming Conventions

- **Component names**: PascalCase (e.g., `QrcodeVue`, `QrcodeSvg`, `QrcodeCanvas`)
- **Variable/function names**: camelCase
- **Constants**: UPPER_SNAKE_CASE for true constants, otherwise camelCase
- **Private fields**: No special prefix; use TypeScript's `private` modifier

### Vue Component Patterns

- Use Composition API with `defineComponent`
- Props defined as objects with `PropType` annotations
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

Follow existing file's style:
- `qrcodegen.ts` uses semicolons consistently (legacy TypeScript/JavaScript)
- `index.ts` uses semicolons mostly for statements but not after function declarations

## Testing

- Tests written with `@rstest/core` and `@vue/test-utils`
- Test files in `test/` directory with `.test.ts` extension
- Use `describe`/`it` pattern
- Mount components with `mount()` from `@vue/test-utils`
- Assertions use `expect()` from `@rstest/core`

Example:
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

- **Rollup**: Bundles for CommonJS, ES module, and UMD (see `rollup.config.js`)
- **Rsbuild**: Development and example building (see `rsbuild.config.js`)
- **TypeScript**: Minimal strict config (see `tsconfig.json`)
- **No separate linting tool** (relies on TypeScript strict checks and editorconfig)

## Project Structure

```
src/
  index.ts          # Main Vue component (exports QrcodeVue, QrcodeSvg, QrcodeCanvas)
  qrcodegen.ts      # QR code generator library (external, Project Nayuki)
test/
  index.test.ts     # Component tests
example/           # Demo application
  webpack-entry.ts  # Entry point for dev server
  webpack.html      # HTML template
  styles.scss       # Demo styles
typings/           # TypeScript declarations
dist/              # Built artifacts (ignored in git)
```

## Notes for Agents

- **Vue 3 only**: peerDependencies specifies `vue: ^3.0.0`
- The QR code generator (`qrcodegen.ts`) is a third‑party library – avoid modifications unless absolutely necessary
- Component supports both canvas and SVG rendering, with gradient and image overlay features
- When adding new props, maintain the existing prop definition pattern with appropriate validators

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
