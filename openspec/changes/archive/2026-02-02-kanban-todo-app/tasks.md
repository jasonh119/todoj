## 1. Project Setup

- [x] 1.1 Initialize Vite project with vanilla TypeScript template
- [x] 1.2 Install SortableJS dependency and its type definitions
- [x] 1.3 Set up project file structure (src/models, src/storage, src/components, src/styles)
- [x] 1.4 Create index.html with root board container and base markup

## 2. Data Model & Persistence

- [x] 2.1 Define TypeScript types for Board, Workstream, and Card (including optional priority enum and tags array)
- [x] 2.2 Implement storage module: save board state to localStorage as JSON
- [x] 2.3 Implement storage module: load board state from localStorage with JSON parsing
- [x] 2.4 Implement corrupted/invalid data handling — fall back to empty board on parse failure or structural mismatch
- [x] 2.5 Implement ID generation using crypto.randomUUID for workstreams and cards

## 3. Board Rendering

- [x] 3.1 Implement board renderer that creates swimlane columns from board state using CSS Grid
- [x] 3.2 Implement empty state display when no workstreams exist (prompt to create first workstream)
- [x] 3.3 Implement card renderer within each swimlane showing title, optional priority indicator, and optional tag labels
- [x] 3.4 Implement distinct visual styles for each priority level (low, medium, high, urgent)

## 4. Workstream Management

- [x] 4.1 Add "New Workstream" button and input for creating a workstream with name validation (reject empty/whitespace)
- [x] 4.2 Implement inline rename for workstream headers with empty name rejection
- [x] 4.3 Implement workstream deletion with confirmation dialog when the workstream contains cards
- [x] 4.4 Implement workstream column reordering via SortableJS drag-and-drop

## 5. Card Management

- [x] 5.1 Add "Add Card" button per swimlane and card creation form with title (required), priority (optional), tags (optional)
- [x] 5.2 Implement card title validation — reject empty/whitespace titles
- [x] 5.3 Implement card edit modal/form for editing title, description, priority, and tags
- [x] 5.4 Implement priority selector with four levels (low, medium, high, urgent) and a "none" option to clear
- [x] 5.5 Implement tag input — add free-form tags, prevent duplicates, allow removal of individual tags
- [x] 5.6 Implement card deletion with confirmation dialog

## 6. Drag-and-Drop

- [x] 6.1 Initialize SortableJS on each swimlane card list with shared group to enable cross-lane dragging
- [x] 6.2 Handle SortableJS onEnd event to update card position in board state (move between swimlanes or reorder within)
- [x] 6.3 Configure drag ghost/preview styling and drop target placeholder indicator
- [x] 6.4 Persist board state after every drag-and-drop operation

## 7. Styling

- [x] 7.1 Define CSS custom properties for colors, spacing, and priority colors
- [x] 7.2 Style board layout — horizontal scroll container with CSS Grid columns for swimlanes
- [x] 7.3 Style swimlane columns — header with name, card stack with Flexbox, add-card button
- [x] 7.4 Style cards — title, priority badge, tag chips, hover/active states
- [x] 7.5 Style modals/dialogs for card editing and delete confirmations
- [x] 7.6 Style drag feedback — ghost opacity, drop placeholder highlight

## 8. Integration & Polish

- [x] 8.1 Wire up app entry point: load state → render board → attach event listeners
- [x] 8.2 Ensure all mutations (create/edit/delete/move) trigger save to localStorage
- [x] 8.3 Verify full round-trip: create workstreams and cards, reload page, confirm state restored
- [x] 8.4 Test corrupted localStorage handling — manually corrupt data and verify empty board fallback
