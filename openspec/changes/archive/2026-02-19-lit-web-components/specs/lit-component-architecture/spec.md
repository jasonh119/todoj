## ADDED Requirements

### Requirement: Application uses a Lit web component tree
The system SHALL render the entire UI as a tree of Lit web components rooted at a `<todo-app>` custom element. The component tree SHALL consist of: `<todo-app>`, `<board-header>`, `<workstream-row>`, `<status-cell>`, `<card-element>`, and `<card-modal>`. Each component SHALL be a class extending `LitElement` and registered via `customElements.define()` using the decorator-free static properties pattern (compatible with `erasableSyntaxOnly: true`).

#### Scenario: Root component renders the application
- **WHEN** the page loads
- **THEN** the `<todo-app>` custom element SHALL render the board header, workstream rows, and modal overlay as child Lit components

#### Scenario: Each component is a registered custom element
- **WHEN** the application initializes
- **THEN** the browser's custom element registry SHALL contain entries for `todo-app`, `board-header`, `workstream-row`, `status-cell`, `card-element`, and `card-modal`

### Requirement: Root component owns board state
The `<todo-app>` component SHALL be the single owner of the `Board` object. It SHALL hold the board as a reactive property declared via `static properties` with `{ state: true }`. Child components SHALL receive data via properties declared with `{ attribute: false }` and SHALL NOT directly mutate the board object.

#### Scenario: Board state is held by todo-app
- **WHEN** the application is running
- **THEN** the `<todo-app>` component SHALL hold the current `Board` object as internal reactive state and pass relevant slices to child components via properties

#### Scenario: Child components do not mutate board directly
- **WHEN** a child component needs to change board state (e.g., rename a workstream)
- **THEN** the child SHALL dispatch a custom event and the `<todo-app>` component SHALL handle the mutation

### Requirement: Components communicate via custom events
Child components SHALL communicate state changes to parent components by dispatching `CustomEvent` instances with `{ bubbles: true, composed: true }`. The `<todo-app>` component SHALL listen for these events and apply the corresponding board mutations.

#### Scenario: Card update dispatches event
- **WHEN** a user saves changes to a card via the modal
- **THEN** the `<card-modal>` component SHALL dispatch a `card-updated` custom event with the updated card data in the event detail

#### Scenario: Events cross shadow DOM boundaries
- **WHEN** a child component dispatches a custom event
- **THEN** the event SHALL be created with `bubbles: true` and `composed: true` so it crosses shadow DOM boundaries to reach `<todo-app>`

### Requirement: Components use reactive properties for rendering
Each component SHALL use Lit's `static properties` block with `{ attribute: false }` for public properties and `{ state: true }` for internal state (decorator-free pattern). TypeScript `declare` statements SHALL provide type annotations. When a reactive property changes, the component SHALL automatically re-render only the affected template portions. Components SHALL NOT manually manipulate their own DOM outside of the `render()` method (except for SortableJS initialization).

#### Scenario: Property change triggers re-render
- **WHEN** the `workstreams` property on `<todo-app>` changes
- **THEN** the component SHALL re-render to reflect the updated workstream list without destroying and recreating the entire DOM tree

#### Scenario: No imperative DOM manipulation in render path
- **WHEN** a component renders its template
- **THEN** the template SHALL use Lit's `html` tagged template literals with declarative bindings (property bindings, event bindings) rather than `document.createElement` or `innerHTML`

### Requirement: Mixed Shadow DOM and Light DOM strategy
Components SHALL use either Shadow DOM or Light DOM based on their integration needs:

- **Shadow DOM** (default `LitElement` behavior): `<todo-app>`, `<board-header>`, `<card-element>` — these components define `static styles` using Lit's `css` tagged template literal for encapsulated styling.
- **Light DOM** (`createRenderRoot() { return this; }`): `<workstream-row>`, `<status-cell>`, `<card-modal>` — these components opt out of Shadow DOM because SortableJS requires direct DOM access to drag targets (`<workstream-row>`, `<status-cell>`) or because the modal overlay must cover the full viewport (`<card-modal>`).

All components SHALL reference the application's CSS custom properties (e.g., `var(--accent)`, `var(--surface)`) for theming, which inherit through shadow boundaries.

#### Scenario: Shadow DOM components have encapsulated styles
- **WHEN** `<card-element>` defines styles for `.card`
- **THEN** those styles SHALL NOT leak to other components or to the global document

#### Scenario: Light DOM components are styled via adopted global CSS
- **WHEN** `<workstream-row>` renders its `.ws-row` grid layout inside `<todo-app>`'s shadow root
- **THEN** the styles SHALL be applied because `<todo-app>` adopts `main.css` into its shadow root via `unsafeCSS`

#### Scenario: CSS custom properties pierce shadow boundaries
- **WHEN** the `:root` defines `--accent: #4f46e5`
- **THEN** all components SHALL be able to use `var(--accent)` in their styles and receive the correct value

### Requirement: todo-app adopts global CSS for light-DOM children
The `<todo-app>` component SHALL import `main.css` as inline text using Vite's `?inline` import and include it in its `static styles` array via `unsafeCSS()`. This ensures that CSS class selectors for light-DOM children (`.ws-row`, `.board-cell`, `.modal-overlay`, drag feedback classes, etc.) apply correctly within the shadow root where those light-DOM components render.

#### Scenario: Light DOM grid layout works inside shadow root
- **WHEN** `<workstream-row>` renders a `.ws-row` div inside `<todo-app>`'s shadow root
- **THEN** the `.ws-row` grid layout (`grid-template-columns: var(--ws-label-width) repeat(3, 1fr)`) SHALL apply because `main.css` is adopted into the shadow root

#### Scenario: Light DOM modal styles work inside shadow root
- **WHEN** `<card-modal>` renders a `.modal-overlay` inside `<todo-app>`'s shadow root
- **THEN** the modal overlay SHALL cover the full viewport with `position: fixed; inset: 0`

### Requirement: Decorator-free TypeScript pattern
The project SHALL use the decorator-free `static properties` pattern with TypeScript `declare` statements instead of decorators. This is required because `tsconfig.json` has `erasableSyntaxOnly: true`, which is incompatible with `experimentalDecorators`. Components SHALL define `static properties = { ... }` blocks and use `declare` for typed property declarations.

#### Scenario: Decorator-free syntax compiles without errors
- **WHEN** a component uses `static properties = { card: { attribute: false } }` and `declare card: Card`
- **THEN** the TypeScript compiler SHALL accept the syntax without errors with `erasableSyntaxOnly: true`
