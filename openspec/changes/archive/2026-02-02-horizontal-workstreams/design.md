## Context

The current kanban board renders workstreams as vertical columns with cards stacked inside each column. This works for independent task lists but doesn't support a workflow where cards move through stages (Backlog → In Progress → Done). The layout needs to be restructured so workstreams are horizontal rows and the columns are fixed status lanes.

The existing codebase is vanilla TypeScript + Vite with SortableJS for drag-and-drop. The Card type currently has no status field — cards simply belong to a workstream.

## Goals / Non-Goals

**Goals:**
- Restructure the board into a grid: workstream rows × status columns
- Add a `status` field to cards with three fixed values: backlog, in-progress, done
- Cards drag horizontally between status columns within their workstream row
- Migrate existing localStorage data gracefully (cards without status default to backlog)
- Maintain all existing card and workstream CRUD functionality

**Non-Goals:**
- Custom or user-defined status columns (fixed to three for now)
- Cross-workstream card movement via drag-and-drop (cards stay in their workstream)
- Collapsible rows or columns
- WIP limits on status columns

## Decisions

### 1. Layout: CSS Grid with fixed columns

**Choice**: Use a CSS Grid with a fixed column template: `[workstream-label] [backlog] [in-progress] [done]`. Each workstream is a row.

**Rationale**: CSS Grid naturally models the 2D layout of rows × columns. The column widths can be equal (`1fr 1fr 1fr`) with a fixed-width label column. This replaces the current horizontal flex/scroll layout of swimlane columns.

**Alternatives considered**:
- Nested flexbox (row per workstream, flex columns inside) — harder to align columns across rows
- HTML table — semantic mismatch, harder to style and animate

### 2. Status as a const union type on Card

**Choice**: Add `status: Status` to the Card interface with `Status = 'backlog' | 'in-progress' | 'done'` as a const object (matching the existing Priority pattern). Status is required, not optional — every card must have a status.

**Rationale**: Status determines which column a card renders in. Making it required simplifies rendering logic. The three values are hardcoded since custom statuses are a non-goal.

### 3. Drag-and-drop: SortableJS with group per cell

**Choice**: Each cell (workstream × status intersection) gets its own SortableJS instance with a shared group scoped to that workstream row. Cards can be dragged between cells in the same row (changing status) and reordered within a cell.

**Rationale**: SortableJS `group` option naturally supports moving items between lists. By giving each row's cells the same group name (e.g., `ws-{id}`), cards can move between status columns but not between workstreams.

**Alternatives considered**:
- Single board-wide group — would allow cross-workstream dragging, which is a non-goal
- Separate Sortable per column across all rows — doesn't map cleanly to the row-scoped constraint

### 4. Workstream reordering: vertical drag on row labels

**Choice**: Use SortableJS on a container of workstream rows, with the workstream label as the drag handle. Dragging reorders rows vertically.

**Rationale**: Same approach as before but rotated — the handle moves from a column header to a row label.

### 5. Data migration: default status to backlog

**Choice**: When loading board state, if a card has no `status` field, assign `'backlog'`. This handles data from the previous schema transparently.

**Rationale**: Non-destructive migration that doesn't require a separate migration step. Old data loads correctly on first access.

## Risks / Trade-offs

- **Grid layout may clip on narrow viewports** → The board will need horizontal scroll when the three status columns plus the label column don't fit. This matches the existing horizontal scroll behavior.
- **SortableJS group-per-row creates many Sortable instances** → For N workstreams, 3N Sortable instances. Acceptable for typical workstream counts (< 20). Performance would degrade for very large boards.
- **Fixed status columns limit flexibility** → Users cannot customize columns. Acceptable for v1; can be extended later by making statuses configurable.
- **Migration only handles missing status field** → If the data shape changes further in the future, a more formal migration system may be needed.
