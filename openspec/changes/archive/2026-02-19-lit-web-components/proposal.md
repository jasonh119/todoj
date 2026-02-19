## Why

The entire UI (485 lines in board.ts) is built with imperative DOM manipulation — `document.createElement`, manual `innerHTML` templates, and hand-wired event listeners. This makes every UI change error-prone, hard to compose, and impossible to test in isolation. Migrating to Lit web components introduces declarative templates, reactive properties, and component encapsulation while staying lightweight (~5KB) and standards-based — no virtual DOM, no proprietary runtime.

## What Changes

- **BREAKING**: Replace monolithic `board.ts` with a tree of Lit web components (`<todo-app>`, `<board-header>`, `<workstream-row>`, `<status-cell>`, `<card-element>`, `<card-modal>`)
- Replace imperative `document.createElement` / `innerHTML` rendering with Lit `html` tagged template literals
- Replace manual `addEventListener` wiring with Lit `@event` bindings in templates
- Replace module-level `currentBoard` / `render()` pattern with reactive properties (`@property`, `@state`) that trigger targeted re-renders
- Add `lit` as a production dependency; add `@lit/task` only if async patterns are needed
- Update `index.html` entry point to use custom element tags instead of `#board` div
- Update `main.ts` to import component registrations instead of calling `initBoard()`
- **Keep unchanged**: TypeScript strict mode, Vite bundler (Lit works with Vite out of the box), localStorage persistence layer (`storage.ts`), CSS custom properties for theming, SortableJS for drag-and-drop, data model types (`types.ts`)

## Capabilities

### New Capabilities

- `lit-component-architecture`: Component tree structure, base patterns, reactive state management, and inter-component communication (events + properties) for the Lit migration

### Modified Capabilities

- `kanban-board`: Board rendering changes from imperative DOM in a single function to a `<todo-app>` root component composing `<board-header>` and `<workstream-row>` children via declarative Lit templates. Drag-and-drop initialization moves into component lifecycle (`connectedCallback` / `firstUpdated`). Visual feedback and layout behavior remain unchanged.
- `card-management`: Card create/edit modals change from imperative overlay construction to a `<card-modal>` Lit component with reactive form state. Card display changes from `createCardElement()` to a `<card-element>` component. CRUD behavior and validation rules remain unchanged.
- `workstream-management`: Workstream rows change from `createWorkstreamRow()` to a `<workstream-row>` component that owns its label, actions, and status cells. Rename, delete, and reorder behavior remain unchanged but are expressed through component methods and Lit event handlers.
- `data-persistence`: No changes to the persistence API or storage format. The `persist()` call pattern changes from a module-level function to a custom event (`board-changed`) dispatched by components, with the root `<todo-app>` handling persistence. Board loading remains in `main.ts`.

## Impact

- `src/components/board.ts` — **deleted entirely**; replaced by 6 component files in `src/components/`
- `src/components/todo-app.ts` — new root component (owns board state, handles persistence)
- `src/components/board-header.ts` — new component (status column headers)
- `src/components/workstream-row.ts` — new component (row label, actions, status cells)
- `src/components/status-cell.ts` — new component (card container, SortableJS host)
- `src/components/card-element.ts` — new component (card display)
- `src/components/card-modal.ts` — new component (create/edit modal with form state)
- `src/main.ts` — simplified to import components and load board into `<todo-app>`
- `index.html` — replace `<div id="board">` with `<todo-app>` custom element; remove `#modal-overlay`
- `src/styles/main.css` — reduced to global resets and CSS custom property definitions; component-specific styles move into each component's `static styles`
- `src/models/types.ts` — unchanged
- `src/storage/storage.ts` — unchanged
- `package.json` — add `lit` dependency (~5KB gzipped)
- `tsconfig.json` — add `"experimentalDecorators": true` for Lit decorators
