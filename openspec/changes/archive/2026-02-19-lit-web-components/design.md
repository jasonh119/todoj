## Context

The todoj kanban app currently has all UI logic in a single 485-line file (`board.ts`) that uses imperative DOM manipulation: `document.createElement`, `innerHTML` templates, and manual `addEventListener` calls. The module-level `currentBoard` variable holds state, and every mutation calls `persist()` then `render()`, which destroys and rebuilds the entire DOM tree. There is no component boundary — rendering, event handling, drag-and-drop setup, and modal management are all interleaved in one module.

The app uses Vite for bundling, SortableJS for drag-and-drop, CSS custom properties for theming, and localStorage for persistence. TypeScript strict mode is enabled. There are no tests or linter configured.

## Goals / Non-Goals

**Goals:**
- Decompose the monolithic `board.ts` into discrete Lit web components with clear boundaries
- Each component owns its template, styles, and reactive state — no full-DOM rebuilds
- Maintain all existing user-facing behavior (card CRUD, drag-and-drop, workstream management)
- Keep the existing data model, persistence layer, and CSS custom properties unchanged
- Enable future testability by having isolated, renderable components

**Non-Goals:**
- Changing the data model or persistence format
- Adding new user-facing features (this is a pure refactor)
- Migrating away from SortableJS (Lit components will host SortableJS instances)
- Adding a state management library (Lit reactive properties are sufficient)
- Server-side rendering or SSR compatibility
- Adding tests as part of this change (separate concern)

## Decisions

### 1. Component tree structure

**Choice**: Six components forming a tree:

```
<todo-app>                    ← root, owns Board state
  <board-header>              ← status column header row
  <workstream-row>            ← one per workstream
    <status-cell>             ← one per status column per workstream
      <card-element>          ← one per card
  <card-modal>                ← singleton, shown/hidden via properties
```

**Rationale**: Maps directly to the existing DOM structure. Each component replaces a clearly identifiable section of `board.ts`: `render()` → `todo-app`, `createWorkstreamRow()` → `workstream-row`, `createCardElement()` → `card-element`, `openCardCreateModal()`/`openCardEditModal()` → `card-modal`. The tree is shallow (max 4 levels) which keeps event bubbling simple.

**Alternatives considered**:
- Fewer components (e.g., merge `status-cell` into `workstream-row`) — loses the clean mapping to SortableJS instances, which need one per cell
- More components (e.g., separate `priority-badge`, `tag-chip`) — over-decomposition for simple display elements that don't need their own reactive state

### 2. State ownership and data flow

**Choice**: `<todo-app>` is the single owner of the `Board` object. It passes data down via properties and listens for mutation events bubbling up from children. The pattern is:

1. Child dispatches a custom event (e.g., `card-updated`, `workstream-deleted`)
2. `<todo-app>` handles the event, mutates the board, calls `saveBoard()`, and re-renders via Lit's reactive update cycle

**Rationale**: This mirrors Lit's recommended unidirectional data flow. The existing `persist()` + `render()` pattern maps cleanly: `persist()` becomes `saveBoard()` in the event handler, and `render()` happens automatically when `@state()` properties change. No state management library is needed because the board object is small and the component tree is shallow.

**Alternatives considered**:
- Each component holds and persists its own slice of state — leads to sync issues and scattered `saveBoard()` calls
- Lit Context protocol — unnecessary overhead for a single shared object in a shallow tree
- Redux/MobX — overkill for this app's complexity

### 3. SortableJS integration in Lit lifecycle

**Choice**: `<status-cell>` initializes its SortableJS instance in `firstUpdated()` (after first render) and destroys it in `disconnectedCallback()`. `<todo-app>` initializes the workstream row reorder Sortable on the rows container, also in `firstUpdated()` and refreshed in `updated()` when workstreams change.

**Rationale**: `firstUpdated()` guarantees the DOM exists. SortableJS needs a real DOM element reference, which Lit provides via `this.renderRoot.querySelector()` or `@query()` decorator. Cleanup in `disconnectedCallback()` prevents memory leaks when components are removed.

**Alternatives considered**:
- Initialize in `connectedCallback()` — DOM may not be rendered yet on first connection
- Initialize in `updated()` only — would re-create Sortable on every reactive update; wasteful and causes flickering
- Use a Lit directive for Sortable — adds complexity without clear benefit for a small number of instances

### 4. SortableJS event-to-Lit-event bridge

**Choice**: When SortableJS fires `onEnd`, the `<status-cell>` component dispatches a `card-moved` CustomEvent with detail `{ cardId, fromStatus, toStatus, newIndex }`. The `<workstream-row>` relays this (or `<todo-app>` catches it directly via bubbling). Similarly, the rows container Sortable dispatches `workstream-reordered` with `{ oldIndex, newIndex }`.

**Rationale**: Keeps SortableJS concerns inside the components that host it. Parent components receive clean, typed custom events and don't need to know about SortableJS internals.

### 5. Modal as a sibling component

**Choice**: `<card-modal>` is a direct child of `<todo-app>`, not nested inside card or workstream components. It renders into the main DOM (not Shadow DOM) using Lit's `createRenderRoot()` override or a portal pattern to ensure it overlays the full viewport.

**Rationale**: Modals need to be positioned over the entire viewport. Placing the modal inside a Shadow DOM host would clip it or require complex CSS. Having `<todo-app>` control the modal's visibility and pass it the card data keeps the flow simple: child dispatches `open-card-modal` event → `<todo-app>` sets modal properties → modal renders.

**Alternatives considered**:
- Modal inside each `<card-element>` — multiple modal instances, z-index issues inside Shadow DOM
- Native `<dialog>` element — viable but doesn't integrate as cleanly with Lit's reactive template model
- Keep modal as imperative code outside components — defeats the purpose of componentization

### 6. Styling strategy

**Choice**: Global CSS (`main.css`) retains only resets, CSS custom property definitions, and body styles. All component-specific styles move into each component's `static styles` using Lit's `css` tagged template. Components reference CSS custom properties (e.g., `var(--accent)`) for theming.

**Rationale**: Lit's Shadow DOM encapsulates component styles, preventing leakage. CSS custom properties pierce Shadow DOM boundaries, so the existing theming system works without modification. Each component becomes self-contained with its own styles.

**Alternatives considered**:
- Keep all styles in `main.css` and disable Shadow DOM — loses encapsulation benefit
- CSS Modules — not natively supported by Lit
- Tailwind inside Shadow DOM — adds build complexity and doesn't align with current CSS custom property approach

### 7. TypeScript decorator configuration

**Choice**: Enable `"experimentalDecorators": true` in `tsconfig.json` to support Lit's `@customElement`, `@property`, `@state`, and `@query` decorators.

**Rationale**: Lit's decorator syntax is the idiomatic way to define reactive properties and custom elements. The standard decorators proposal (TC39 Stage 3) is not yet fully supported by Lit's tooling, so the experimental/legacy decorator mode is required.

### 8. Migration order

**Choice**: Migrate bottom-up — start with leaf components (`card-element`, `board-header`), then composites (`status-cell`, `card-modal`), then containers (`workstream-row`), then root (`todo-app`). The final step replaces `board.ts` imports in `main.ts` with component registrations.

**Rationale**: Bottom-up allows each component to be built and verified before its parent depends on it. Leaf components have no child-component dependencies, making them the simplest starting point.

## Risks / Trade-offs

- **SortableJS + Shadow DOM conflict** → SortableJS queries the DOM via `querySelectorAll` and may not penetrate Shadow DOM boundaries. Mitigation: Use `this.renderRoot` as the SortableJS container element, which correctly scopes to the component's shadow root. If issues persist, `<status-cell>` can use `createRenderRoot() { return this; }` to opt out of Shadow DOM for that component only.
- **Event bubbling across Shadow DOM** → Custom events must be created with `{ bubbles: true, composed: true }` to cross shadow boundaries. Mitigation: Enforce this in a helper function or base class that all components extend.
- **Modal z-index in Shadow DOM** → The modal needs to overlay the entire viewport. Mitigation: `<card-modal>` uses `position: fixed` inside `<todo-app>`'s shadow root, or renders into the light DOM via `createRenderRoot()` override.
- **Bundle size increase** → Lit adds ~5KB gzipped. Acceptable given the app currently has zero framework overhead and the total will remain under 20KB.
- **Learning curve** → Developers unfamiliar with Lit need to understand reactive properties, tagged templates, and Shadow DOM. Mitigation: The component tree is shallow and each component is small (< 100 lines).
- **No incremental migration path** → The switch from imperative to declarative rendering is all-or-nothing for the board. Mitigation: Build all components before switching `main.ts`, then swap in one commit. The data model and storage layer remain untouched, so rollback is straightforward.
