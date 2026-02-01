## Why

The current layout uses workstreams as vertical columns, which makes every workstream act as an independent list. A standard kanban workflow needs fixed status columns (Backlog, In Progress, Done) with workstreams as horizontal rows, so users can track cards moving through stages across multiple workstreams simultaneously.

## What Changes

- **BREAKING**: Board layout changes from vertical workstream columns to a grid with fixed status columns (Backlog, In Progress, Done) and horizontal workstream rows
- Cards now have a `status` field that determines which column they appear in
- Drag-and-drop moves cards horizontally between status columns (and optionally vertically between workstreams)
- Cards are reorderable within a cell (same workstream + same status)
- Workstreams render as horizontal rows rather than vertical columns
- New cards default to the Backlog column of their workstream
- The status columns are fixed and not user-configurable in this iteration

## Capabilities

### New Capabilities

- `status-columns`: Fixed status columns (Backlog, In Progress, Done) that define the horizontal axis of the board

### Modified Capabilities

- `kanban-board`: Board layout changes from vertical swimlane columns to a grid of workstream rows × status columns. Drag-and-drop changes from moving between swimlanes to moving between status columns within a workstream row.
- `card-management`: Cards gain a required `status` field. New cards default to Backlog status.
- `workstream-management`: Workstreams render as horizontal rows instead of vertical columns. Reordering changes from horizontal column dragging to vertical row dragging.
- `data-persistence`: Board state must include card status field and persist the new grid structure.

## Impact

- `src/models/types.ts` — add Status type, add `status` field to Card
- `src/components/board.ts` — rewrite board rendering from column layout to row × column grid, update all drag-and-drop logic
- `src/styles/main.css` — rewrite board grid layout from horizontal columns to CSS Grid with rows and columns
- `src/storage/storage.ts` — update validation to include status field; handle migration of old data (cards without status default to Backlog)
- Existing localStorage data from v1 needs graceful migration
