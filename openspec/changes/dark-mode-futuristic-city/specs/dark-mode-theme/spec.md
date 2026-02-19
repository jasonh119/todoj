## ADDED Requirements

### Requirement: Dark color scheme with futuristic city palette
The system SHALL provide a dark color scheme that overrides all CSS custom properties defined in `:root`. The dark palette SHALL use deep navy backgrounds (#0a0e1a for --bg, #121829 for --surface), neon cyan accent (#00e5ff for --accent), off-white text (#e0e6f0 for --text), blue-gray secondary text (#8892a8 for --text-secondary), and muted borders (#1e2740 for --border). The dark scheme SHALL be applied via a `[data-theme="dark"]` CSS selector on the `<html>` element that overrides the `:root` custom properties.

#### Scenario: Dark theme applies correct colors
- **WHEN** the `<html>` element has `data-theme="dark"` set
- **THEN** all UI elements SHALL use the dark palette colors defined by the overridden custom properties

#### Scenario: Light theme remains default
- **WHEN** no `data-theme` attribute is set on the `<html>` element
- **THEN** the system SHALL display the existing light color scheme from `:root`

#### Scenario: All interactive states render correctly in dark mode
- **WHEN** dark mode is active and the user interacts with UI elements (hover, focus, drag)
- **THEN** hover states, focus rings, drag feedback, and modal overlays SHALL be visible and readable against the dark backgrounds

### Requirement: Theme toggle button in app header
The system SHALL display a theme toggle button in the app header. The button SHALL be positioned to the left of the existing "+ New Workstream" button. Clicking the button SHALL toggle between light and dark modes by adding or removing the `data-theme="dark"` attribute on the `<html>` element. The button SHALL display a visual indicator of the current theme (moon icon for light mode indicating dark is available, sun icon for dark mode indicating light is available).

#### Scenario: Toggle from light to dark mode
- **WHEN** the user clicks the theme toggle button while in light mode
- **THEN** the system SHALL set `data-theme="dark"` on the `<html>` element, the UI SHALL immediately switch to the dark color scheme, and the button indicator SHALL update to show the sun icon

#### Scenario: Toggle from dark to light mode
- **WHEN** the user clicks the theme toggle button while in dark mode
- **THEN** the system SHALL remove the `data-theme` attribute from the `<html>` element, the UI SHALL immediately switch to the light color scheme, and the button indicator SHALL update to show the moon icon

### Requirement: Theme preference persistence
The system SHALL persist the user's theme preference in localStorage under a `theme` key with the value `"light"` or `"dark"`. The preference SHALL be saved every time the user toggles the theme. On application startup, the system SHALL read the stored preference and apply it before the first render to prevent a flash of the wrong theme. If no preference is stored, the system SHALL default to light mode.

#### Scenario: Theme preference survives page reload
- **WHEN** the user sets dark mode and reloads the page
- **THEN** the application SHALL load in dark mode without briefly displaying light mode

#### Scenario: No stored preference defaults to light
- **WHEN** the application loads with no theme preference in localStorage
- **THEN** the system SHALL display the light color scheme

#### Scenario: Theme preference is independent of board data
- **WHEN** the user clears board data from localStorage
- **THEN** the theme preference SHALL be retained because it uses a separate localStorage key

### Requirement: Dark mode card and priority badge visibility
The system SHALL ensure that priority badges, tag chips, and card elements remain readable in dark mode. Priority badge colors SHALL be adjusted for visibility against dark backgrounds. The medium priority badge text SHALL use white text instead of the dark text used in light mode. Card hover shadows SHALL use a lighter or more visible shadow value in dark mode.

#### Scenario: Priority badges are readable in dark mode
- **WHEN** dark mode is active and cards with priority badges are displayed
- **THEN** all priority badge colors (low, medium, high, urgent) SHALL be clearly visible and text within badges SHALL have sufficient contrast

#### Scenario: Card hover state is visible in dark mode
- **WHEN** dark mode is active and the user hovers over a card
- **THEN** the card SHALL show a visible shadow or border change distinguishable from the dark background

### Requirement: Dark mode modal rendering
The system SHALL ensure modals render correctly in dark mode. The modal overlay SHALL use a darker backdrop (increased opacity) to maintain the dimming effect against the dark background. Modal surfaces, inputs, selects, and textareas SHALL use the dark theme surface and border colors. Focus states on form elements SHALL remain visible.

#### Scenario: Modal is readable in dark mode
- **WHEN** dark mode is active and the user opens a card creation or edit modal
- **THEN** the modal background, text, inputs, and buttons SHALL use the dark theme colors and be fully readable

#### Scenario: Modal overlay dims dark background
- **WHEN** dark mode is active and a modal is open
- **THEN** the overlay background SHALL be dark enough to visually separate the modal from the board behind it
