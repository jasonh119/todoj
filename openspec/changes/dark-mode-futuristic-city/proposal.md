## Why

The application currently uses a fixed light color scheme with no theming options. Users working in low-light environments or who prefer dark interfaces have no alternative. Adding a dark mode with a futuristic city aesthetic provides a visually distinctive theme and lays the groundwork for theme switching.

## What Changes

- Add a dark mode color scheme using CSS custom properties, themed around a futuristic cityscape palette (deep blues, neon accents, muted surfaces)
- Add a theme toggle button in the app header to switch between light and dark modes
- Persist the user's theme preference in localStorage so it survives page reloads
- Apply the dark theme by toggling a `data-theme="dark"` attribute on the document root, which swaps CSS custom property values
- Ensure all UI elements (board, cards, modals, status headers, drag feedback) render correctly in both themes

## Capabilities

### New Capabilities

- `dark-mode-theme`: Dark color scheme with futuristic city aesthetic, theme toggle in the header, and theme preference persistence via localStorage

### Modified Capabilities

- `kanban-board`: Board header gains a theme toggle button. Board background and surface colors adapt to the active theme.

## Impact

- `src/styles/main.css` -- add `[data-theme="dark"]` block overriding `:root` custom properties with dark palette values; add `--card-hover-shadow` custom property to `:root` and dark override
- `src/components/todo-app.ts` -- add theme toggle button to the `app-header` template, wire up click handler to toggle `data-theme` attribute and persist preference, add reactive `_darkMode` state property
- `src/components/card-element.ts` -- replace hardcoded hover `box-shadow` with `var(--card-hover-shadow)` so dark mode override inherits through shadow DOM
- `src/storage/storage.ts` -- add helper functions to read/write theme preference from localStorage (separate key from board data)
- `src/main.ts` -- apply saved theme preference on startup before first render
- `index.html` -- no structural changes expected; theme applied via `data-theme` attribute on `<html>`
