## Context

The application uses CSS custom properties defined in `:root` for all colors (--bg, --surface, --text, --accent, etc.). All UI elements reference these properties, so swapping their values is sufficient to re-theme the entire application. There is no existing theme infrastructure -- the light palette is the only one.

The app persists board data in localStorage under a single key. Theme preference is independent of board state and should use a separate localStorage key.

## Goals / Non-Goals

**Goals:**
- Define a dark color palette inspired by a futuristic cityscape (deep navy/charcoal backgrounds, neon cyan/purple accents, soft white text)
- Implement theme switching via a `data-theme="dark"` attribute on `<html>` that overrides `:root` custom properties
- Add a toggle button in the app header for switching between light and dark modes
- Persist theme preference in localStorage and apply it before first render to avoid flash of wrong theme
- Ensure all interactive states (hover, focus, drag feedback, modals) look correct in dark mode

**Non-Goals:**
- System preference detection via `prefers-color-scheme` (can be added later)
- Per-user theme preference sync (localStorage only, no server)
- Custom theme builder or additional theme options beyond light/dark
- Animated theme transition effects

## Decisions

### 1. Theme application: data-theme attribute on html element

**Choice**: Set `data-theme="dark"` on the `<html>` element. CSS uses `[data-theme="dark"]` selector to override `:root` custom properties.

**Rationale**: The `:root` selector and `html` element refer to the same node, so `[data-theme="dark"]` on `html` has higher specificity than bare `:root` and cleanly overrides all properties. This is a standard pattern for CSS custom property theming.

**Alternatives considered**:
- Class-based (`html.dark`) -- works but `data-*` attributes are more semantic for state
- Separate stylesheet loaded dynamically -- more complex, flash-of-unstyled-content risk
- CSS `prefers-color-scheme` media query only -- no manual toggle, depends on OS setting

### 2. Color palette: futuristic city aesthetic

**Choice**: Dark backgrounds using deep navy (#0a0e1a, #121829), neon cyan (#00e5ff) as the primary accent replacing the indigo, softer secondary accent (#7c4dff), muted borders (#1e2740). Text uses off-white (#e0e6f0) for primary and blue-gray (#8892a8) for secondary.

**Rationale**: The futuristic city aesthetic calls for high-contrast neon accents against dark surfaces. Cyan and purple are archetypal cyberpunk/futuristic colors. The dark navy base avoids pure black, which feels flat on screens.

### 3. Theme toggle: button in the app header

**Choice**: Add a simple text/icon button to the right side of the app header, next to the existing "+ New Workstream" button. The button displays a sun/moon indicator and toggles theme on click.

**Rationale**: The header already has the "add workstream" button, so placing the theme toggle there keeps controls co-located. A simple button avoids adding UI complexity.

### 4. Theme persistence: separate localStorage key

**Choice**: Store theme preference under a `theme` key in localStorage (value: `"light"` or `"dark"`). Read this key in `main.ts` before calling `initBoard` to apply the theme before first render.

**Rationale**: Theme preference is independent of board data. Using a separate key avoids coupling it to the board schema and its migration logic. Reading it early in `main.ts` prevents a flash of the wrong theme.

### 5. Priority badge colors in dark mode

**Choice**: Keep the same priority colors (green, yellow, orange, red) but slightly increase brightness for visibility against dark backgrounds. The medium priority badge text color switches from dark text to white since the dark background no longer provides contrast.

**Rationale**: Priority colors are semantic and should remain recognizable. Minor brightness adjustments ensure readability without changing the meaning.

## Risks / Trade-offs

- **Flash of light theme on slow loads** -- Mitigated by reading theme preference synchronously in main.ts before any rendering. Since localStorage reads are synchronous, the attribute is set before CSS paints.
- **Card hover shadows need adjustment** -- The current `rgba(0,0,0,0.08)` shadow is invisible on dark backgrounds. The dark theme overrides shadow values to use a lighter glow or increased opacity.
- **Modal overlay contrast** -- The `rgba(0,0,0,0.4)` overlay needs to be darker in dark mode to maintain the dimming effect against an already-dark background. Override to `rgba(0,0,0,0.6)`.
- **No system preference detection** -- Users who prefer dark mode at the OS level still get light mode by default on first visit. Acceptable for v1; `prefers-color-scheme` can be added as an enhancement.
