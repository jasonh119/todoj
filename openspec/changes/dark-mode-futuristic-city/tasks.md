## 1. Dark Theme CSS

- [ ] 1.1 Add `[data-theme="dark"]` block in src/styles/main.css that overrides all `:root` custom properties with the futuristic city dark palette (--bg: #0a0e1a, --surface: #121829, --text: #e0e6f0, --text-secondary: #8892a8, --border: #1e2740, --accent: #00e5ff, --accent-hover: #00b8d4, --danger: #ff5252, --danger-hover: #d32f2f)
- [ ] 1.2 Add dark mode overrides for priority colors with increased brightness for dark background visibility
- [ ] 1.3 Override medium priority badge text color to white in dark mode (light mode uses --text)
- [ ] 1.4 Add a `--card-hover-shadow` CSS custom property to `:root` (light value: `0 2px 8px rgba(0,0,0,0.08)`) and override it in `[data-theme="dark"]` with a visible glow. Update `card-element.ts` shadow styles to use `var(--card-hover-shadow)` instead of the hardcoded rgba value
- [ ] 1.5 Override modal overlay background to rgba(0,0,0,0.6) in dark mode for stronger dimming
- [ ] 1.6 Override card-ghost and card-chosen drag feedback styles for dark mode visibility

## 2. Theme Toggle Button

- [ ] 2.1 Add a theme toggle button element in the `<todo-app>` component's header template in src/components/todo-app.ts, positioned to the left of the "+ New Workstream" button
- [ ] 2.2 Display moon icon when in light mode, sun icon when in dark mode (use text/emoji or simple SVG) in the `<todo-app>` component
- [ ] 2.3 Wire click handler in `<todo-app>` to toggle `data-theme="dark"` attribute on the `<html>` element
- [ ] 2.4 Update button icon on toggle to reflect current theme state via reactive state in `<todo-app>`
- [ ] 2.5 Style the theme toggle button in `<todo-app>`'s `static styles` to match the header aesthetic in both themes

## 3. Theme Persistence

- [ ] 3.1 Add `loadTheme(): string` and `saveTheme(theme: string): void` helper functions in src/storage/storage.ts using a `theme` localStorage key (separate from board data)
- [ ] 3.2 Call `saveTheme()` every time the theme toggle button is clicked
- [ ] 3.3 In src/main.ts, read theme preference with `loadTheme()` and apply `data-theme` attribute on `<html>` before calling `initBoard()` to prevent flash of wrong theme

## 4. Dark Mode Form Elements

- [ ] 4.1 Ensure modal input, textarea, and select elements use dark surface and border colors via existing custom properties (verify no hardcoded colors)
- [ ] 4.2 Verify focus states on form elements remain visible in dark mode (accent-colored border)
- [ ] 4.3 Verify the rename-input for workstream names (in `<workstream-row>` light DOM) uses custom properties and works in dark mode

## 5. Integration and Verification

- [ ] 5.1 Verify TypeScript compiles cleanly with strict mode (npm run build)
- [ ] 5.2 Verify light mode appearance is unchanged (no regression)
- [ ] 5.3 Verify dark mode applies correctly to all board elements: header, status columns, workstream labels, board cells, cards, priority badges, tag chips
- [ ] 5.4 Verify theme toggle works and persists across page reloads
- [ ] 5.5 Verify modals render correctly in dark mode (creation and edit modals)
- [ ] 5.6 Verify drag-and-drop feedback is visible in dark mode
