## 1. Data Model Updates

- [x] 1.1 Add Status const object and type to src/models/types.ts (backlog, in-progress, done)
- [x] 1.2 Add required `status` field to Card interface
- [x] 1.3 Update storage validation to check for valid status values and default to backlog if missing/invalid
- [x] 1.4 Update generateId and any card creation helpers to include default status

## 2. Storage Migration

- [x] 2.1 Update loadBoard to migrate legacy cards without a status field (default to backlog)
- [x] 2.2 Update saveBoard serialization to include status field
- [x] 2.3 Verify corrupted data handling still works with the new status field

## 3. Board Layout Restructure

- [x] 3.1 Rewrite board renderer from vertical swimlane columns to CSS Grid with workstream rows × status columns
- [x] 3.2 Render status column headers (Backlog, In Progress, Done) across the top of the board
- [x] 3.3 Render each workstream as a horizontal row with a label on the left
- [x] 3.4 Render cards into the correct grid cell based on workstream + status
- [x] 3.5 Update empty state to still prompt for first workstream creation

## 4. Drag-and-Drop Rework

- [x] 4.1 Initialize SortableJS per grid cell with group scoped to workstream row (cards move between status columns only, not between workstreams)
- [x] 4.2 Handle onEnd event to update card status when moved between columns
- [x] 4.3 Handle reorder within the same cell (same workstream + same status)
- [x] 4.4 Persist board state after every drag operation
- [x] 4.5 Set up workstream row reordering via SortableJS with row label as drag handle

## 5. Card Management Updates

- [x] 5.1 Update card creation modal to default new cards to backlog status
- [x] 5.2 Add status selector to card edit modal (Backlog, In Progress, Done)
- [x] 5.3 Update card creation and edit save handlers to include status field

## 6. Workstream Management Updates

- [x] 6.1 Update workstream creation to render as a new row with empty cells for each status column
- [x] 6.2 Update workstream deletion to remove the row and all cards across all status columns
- [x] 6.3 Update workstream rename to work on the row label
- [x] 6.4 Update workstream reorder from horizontal column drag to vertical row drag

## 7. Styling Updates

- [x] 7.1 Rewrite board CSS from horizontal swimlane columns to CSS Grid (rows × columns)
- [x] 7.2 Style status column headers
- [x] 7.3 Style workstream row labels with drag handle
- [x] 7.4 Style grid cells as card containers with min-height for empty drop targets
- [x] 7.5 Update drag feedback styles for the new grid layout
- [x] 7.6 Update modal styles for status selector

## 8. Integration & Verification

- [x] 8.1 Verify TypeScript compiles cleanly with new types
- [x] 8.2 Verify Vite build succeeds
- [x] 8.3 Verify legacy localStorage data migrates correctly (cards get backlog status)
- [x] 8.4 Verify drag-and-drop between status columns updates card status and persists
