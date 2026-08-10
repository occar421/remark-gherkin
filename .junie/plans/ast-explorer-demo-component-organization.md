# AST Explorer Demo Component Organization Plan

## Objective

Reorganize `packages/ast-explorer-demo/src` so that UI components and their CSS are grouped by responsibility. Every directory directly under `src/components` must use `UpperCamelCase`, matching the primary component name.

This plan is intentionally behavior-preserving: the demo layout, editor behavior, AST interaction, lint settings, and persisted content must remain unchanged.

## Target Structure

```text
packages/ast-explorer-demo/src/
├── App.tsx
├── components/
│   ├── AstPane/
│   │   ├── AstPane.css
│   │   ├── AstPane.tsx
│   │   └── index.ts
│   ├── EditorPane/
│   │   ├── EditorPane.css
│   │   ├── EditorPane.tsx
│   │   └── index.ts
│   ├── Header/
│   │   ├── Header.css
│   │   ├── Header.tsx
│   │   └── index.ts
│   ├── JsonViewer/
│   │   ├── JsonItem.tsx
│   │   ├── JsonViewer.css
│   │   ├── JsonViewer.tsx
│   │   └── index.ts
│   ├── SettingsPanel/
│   │   ├── SettingsPanel.css
│   │   ├── SettingsPanel.tsx
│   │   └── index.ts
│   └── TreeConfig/
│       ├── TreeConfig.css
│       ├── TreeConfig.tsx
│       └── index.ts
├── hooks/
│   └── useContent.ts
├── lib/
│   ├── ast-utils.ts
│   └── lint-utils.ts
├── main.tsx
└── styles/
    ├── globals.css
    ├── layout.css
    └── tokens.css
```

The `components` directory names are fixed as `AstPane`, `EditorPane`, `Header`, `JsonViewer`, `SettingsPanel`, and `TreeConfig`. Do not use lowercase or kebab-case directory names for these components.

## Step Definitions

### 1. Establish the destination structure

- [ ] Create the `components`, `hooks`, `lib`, and `styles` directories under `packages/ast-explorer-demo/src`.
- [ ] Create the six `UpperCamelCase` component directories listed above.
- [ ] Keep `App.tsx` and `main.tsx` at the `src` root unless a later requirement explicitly changes the application entry-point convention.

- [ ] **Completion criteria:** all component directories directly under `src/components` use `UpperCamelCase` and contain only files belonging to that component.

### 2. Move and normalize component implementation files

- [ ] Move `EditorPane.tsx` and `EditorPane.css` into `components/EditorPane/`.
- [ ] Move `AstPane.tsx` into `components/AstPane/` and keep its tree configuration dependency explicit.
- [ ] Move `JsonViewer.tsx` and `JsonItem.tsx` into `components/JsonViewer/` because they form one recursive JSON tree renderer.
- [ ] Extract the JSX currently returned by `useHeader.tsx` into `components/Header/Header.tsx`.
- [ ] Extract the JSX currently returned by `useSettingsPanel.tsx` into `components/SettingsPanel/SettingsPanel.tsx`.
- [ ] Extract the JSX currently returned by `useTreeConfig.tsx` into `components/TreeConfig/TreeConfig.tsx`.
- [ ] Add `index.ts` files only when they make imports clearer; each barrel must export the public component and its public types without introducing circular dependencies.

- [ ] **Completion criteria:** UI components no longer depend on files in the old `src`-root component locations, and component behavior is unchanged.

### 3. Separate hooks and non-UI utilities

- [ ] Move `content-hook.ts` to `hooks/useContent.ts` and preserve its local-storage fallback behavior.
- [ ] If state logic remains inside the extracted `Header`, `SettingsPanel`, or `TreeConfig`, keep it colocated only when it is component-specific; otherwise move it to a clearly named hook under `hooks`.
- [ ] Move `ast-utils.ts` and `lint-utils.ts` to `lib/` because they contain parsing, AST, and linting utilities rather than UI components.
- [ ] Preserve the existing public types used by `App.tsx`, `EditorPane`, and lint marker handling.

- [ ] **Completion criteria:** `hooks` contains reusable React hooks, `lib` contains non-UI utilities, and no utility is moved into a component directory solely to shorten a relative import.

### 4. Split the CSS by responsibility

- [ ] Move design tokens, color variables, typography variables, and dark-mode variables from `style.css` to `styles/tokens.css`.
- [ ] Move global element rules such as `body`, headings, paragraphs, and code defaults to `styles/globals.css`.
- [ ] Move application shell and responsive layout rules such as `#root`, `.app-container`, `main`, `.editor-pane-wrapper`, and `.ast-pane-container` to `styles/layout.css`.
- [ ] Put editor-specific rules, including `.editor-pane`, `.reset-button`, and `.ast-source-highlight`, in `components/EditorPane/EditorPane.css`.
- [ ] Put AST tree rules in `components/AstPane/AstPane.css` and JSON renderer rules in `components/JsonViewer/JsonViewer.css`.
- [ ] Put header, settings panel, and tree configuration rules in `Header.css`, `SettingsPanel.css`, and `TreeConfig.css` respectively.
- [ ] Import the three global style files from `main.tsx`; import component CSS from the component that owns the relevant markup.
- [ ] Remove `style.css` only after every selector has been assigned to exactly one destination and no import remains.

- [ ] **Completion criteria:** every existing selector has one intentional owner, CSS is loaded exactly once, and the rendered page has no visual regression in light or dark color schemes.

### 5. Update imports and public paths

- [ ] Update `App.tsx`, `AstPane.tsx`, `JsonViewer.tsx`, and all extracted components to use the new locations.
- [ ] Update file extensions consistently with the existing TypeScript/ESM convention used by the package.
- [ ] Prefer imports from component `index.ts` files at composition boundaries, while allowing direct sibling imports inside a component directory.
- [ ] Search the entire repository for old paths such as `./EditorPane`, `./AstPane`, `./JsonViewer`, `./useHeader`, `./useSettingsPanel`, and `./useTreeConfig`.

- [ ] **Completion criteria:** TypeScript resolves every import, no old source path remains, and there are no duplicate component definitions.

### 6. Validate the migration

- [ ] Run `vp check` from the repository root and fix formatting, lint, and type errors.
- [ ] Run `vp test` from the repository root.
- [ ] Run the demo package build with `vp run --filter ast-explorer-demo build` or the equivalent workspace command supported by the current Vite+ configuration.
- [ ] Confirm the editor can reset content, lint markers still render, cursor-to-AST focus still works, tree hover still highlights source ranges, and settings remain functional.
- [ ] Verify both light and dark color schemes and a narrow viewport to cover the CSS split and responsive layout.

- [ ] **Completion criteria:** checks, tests, and the demo build pass without skip flags, and the listed interactive behaviors remain functional.

## Risks and Mitigations

- **CSS ordering changes:** retain the current import order for tokens, globals, layout, and component styles; inspect the generated page in both color schemes.
- **Hook extraction regressions:** preserve state ownership and callback dependencies while changing only file and component boundaries.
- **Extension mismatches:** use the package's existing ESM import convention consistently and let the type checker catch unresolved paths.
- **Incomplete selector migration:** compare the original `style.css` selector list with the destination files before deleting the original file.

## Definition of Done

- [ ] All directories directly under `src/components` use `UpperCamelCase`.
- [ ] Each component's implementation and CSS are colocated in its corresponding directory.
- [ ] Global styles, hooks, and utilities have clear separate destinations.
- [ ] No stale imports or duplicate source files remain.
- [ ] `vp check`, `vp test`, and the demo build pass.
- [ ] The demo's existing editor, AST, lint, hover, settings, persistence, and responsive behaviors are preserved.
