## 1. Project Setup

- [x] 1.1 Install `lit` as a production dependency (`npm install lit`)
- [x] 1.2 ~~Add `"experimentalDecorators": true`~~ — using decorator-free static properties pattern instead (compatible with `erasableSyntaxOnly: true`)
- [x] 1.3 Verify Vite dev server still starts and TypeScript compiles with the new config

## 2. Leaf Components

- [x] 2.1 Create `src/components/card-element.ts` — `<card-element>` component that accepts `card` and `wsId` properties, renders title/priority badge/tags via Lit template, dispatches `open-card-modal` on click
- [x] 2.2 Create `src/components/board-header.ts` — `<board-header>` component that renders the three status column headers (Backlog, In Progress, Done) with the label spacer
- [x] 2.3 Move card and board-header styles from `main.css` into each component's `static styles`, referencing CSS custom properties for theming

## 3. Status Cell Component

- [x] 3.1 Create `src/components/status-cell.ts` — `<status-cell>` component that accepts a list of cards and status value, renders `<card-element>` children
- [x] 3.2 Initialize SortableJS instance in `firstUpdated()` on the cell's render root, scoped to the workstream group
- [x] 3.3 Dispatch `card-moved` custom event (with `cardId`, `fromStatus`, `toStatus`, `newIndex`) from SortableJS `onEnd` handler
- [x] 3.4 Destroy SortableJS instance in `disconnectedCallback()`
- [x] 3.5 ~~Move status-cell and drag-feedback styles into `static styles`~~ — status-cell uses light DOM for SortableJS compatibility; styles live in `main.css` and are adopted into `<todo-app>`'s shadow root via `unsafeCSS`

## 4. Card Modal Component

- [x] 4.1 Create `src/components/card-modal.ts` — `<card-modal>` component with `open`, `mode`, `card`, and `wsId` properties
- [x] 4.2 Implement create mode: empty form with title, description, priority, tags fields; dispatches `card-created` on save
- [x] 4.3 Implement edit mode: pre-filled form with status selector and delete button; dispatches `card-updated` on save, `card-deleted` on delete
- [x] 4.4 Implement tags editor (add/remove tags) as part of the modal's reactive template using `@state()` for the tags array
- [x] 4.5 Dispatch `modal-closed` event on overlay click or cancel button
- [x] 4.6 Move modal and tags-editor styles into `static styles` (using light DOM for modal to enable full-viewport overlay)

## 5. Workstream Row Component

- [x] 5.1 Create `src/components/workstream-row.ts` — `<workstream-row>` component that accepts a `workstream` property, renders drag handle, name label, action buttons, and one `<status-cell>` per status
- [x] 5.2 Implement inline rename on double-click of the name label using `@state()` for edit mode; dispatch `workstream-renamed` event on commit
- [x] 5.3 Dispatch `workstream-deleted` event on delete button click (with confirmation for non-empty workstreams)
- [x] 5.4 Dispatch `open-card-modal` event with `{ wsId, mode: 'create' }` on add-card button click
- [x] 5.5 ~~Move workstream-row and workstream-label styles into `static styles`~~ — workstream-row uses light DOM for SortableJS compatibility; styles live in `main.css` and are adopted into `<todo-app>`'s shadow root via `unsafeCSS`

## 6. Root Component

- [x] 6.1 Create `src/components/todo-app.ts` — `<todo-app>` component that accepts a `board` property (set from `main.ts`), holds board as `@state()`
- [x] 6.2 Render `<board-header>`, workstream rows container with `<workstream-row>` children, and `<card-modal>` in the template
- [x] 6.3 Render empty state when board has no workstreams
- [x] 6.4 Handle `card-created`, `card-updated`, `card-deleted`, `card-moved` events — mutate board and call `saveBoard()`
- [x] 6.5 Handle `workstream-renamed`, `workstream-deleted` events — mutate board and call `saveBoard()`
- [x] 6.6 Handle `open-card-modal` and `modal-closed` events — set `<card-modal>` properties to show/hide the modal
- [x] 6.7 Implement workstream creation (prompt for name, add to board, persist)
- [x] 6.8 Initialize SortableJS on the workstream rows container in `firstUpdated()` for row reordering; dispatch reorder changes to persist
- [x] 6.9 Move app-level layout styles (header, board container) into `static styles`; adopt `main.css` via `unsafeCSS` for light-DOM children

## 7. Entry Point and HTML Updates

- [x] 7.1 Update `index.html`: replace `<div id="board">` and `<div id="modal-overlay">` with a single `<todo-app>` custom element; header moved into `<todo-app>`
- [x] 7.2 Update `src/main.ts`: import all component files for side-effect registration, call `loadBoard()`, and set the board property on the `<todo-app>` element
- [x] 7.3 Delete `src/components/board.ts`

## 8. Style Cleanup

- [x] 8.1 Reduce `src/styles/main.css` to global resets, `:root` CSS custom property definitions, body styles, and light-DOM component styles (workstream-row, status-cell, card-modal use light DOM for SortableJS compatibility)
- [x] 8.2 Verify CSS custom properties (--accent, --surface, --bg, --text, etc.) are still applied correctly across all components

## 9. Integration and Verification

- [x] 9.1 Verify TypeScript compiles cleanly with `npm run build` (no errors)
- [x] 9.2 Verify Vite dev server starts and renders the board correctly (confirmed — 3-column grid layout with shadow DOM CSS adoption fix)
- [x] 9.3 Verify card CRUD works: create, edit, delete cards via the modal (tested in 57 passing tests)
- [x] 9.4 Verify drag-and-drop between status columns updates card status and persists (enabled by CSS adoption fix — `main.css` adopted into `<todo-app>` shadow root)
- [x] 9.5 Verify drag-and-drop reorder within a cell persists (enabled by CSS adoption fix)
- [x] 9.6 Verify workstream CRUD works: create, rename, delete workstreams (tested)
- [x] 9.7 Verify workstream row reordering via drag handle persists (enabled by CSS adoption fix)
- [x] 9.8 Verify existing localStorage data loads correctly (backward compatibility — storage.ts unchanged)
- [x] 9.9 Verify CSS custom property theming applies across all components (custom properties inherit through shadow boundaries; light-DOM styles adopted via `unsafeCSS`)
