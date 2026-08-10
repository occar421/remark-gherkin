# CSS Convention

Styles in this demo are organized by ownership:

- `src/styles/tokens.css` contains only shared custom properties and theme values.
- `src/styles/globals.css` contains document-level element defaults.
- `src/styles/layout.css` contains the application shell and responsive layout.
- A component's CSS stays next to its component and is imported by that component.

Component selectors use a BEM-style naming convention:

- A component block uses the component name, such as `.header`, `.editor-pane`, or `.json-viewer`.
- Child elements use two underscores, such as `.header__title`.
- Variations use two hyphens, such as `.json-viewer__item--active`.
- Every selector must include its component block so that class names cannot collide with another component.
- Element selectors are allowed only when they are scoped by a component block or belong in `globals.css`.

When adding a component, create its CSS beside the component, import it from the component entry file, and keep all component-specific selectors inside that block's namespace.
