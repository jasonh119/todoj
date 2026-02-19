## MODIFIED Requirements

### Requirement: Board layout displays swimlanes as columns
The system SHALL render the kanban board as a grid with workstream rows along the vertical axis and three fixed status columns (Backlog, In Progress, Done) along the horizontal axis. The board SHALL be rendered by the `<todo-app>` component, which composes a `<board-header>` component for the column headers and one `<workstream-row>` component per workstream. Each `<workstream-row>` SHALL contain one `<status-cell>` component per status column, and each `<status-cell>` SHALL render `<card-element>` components for the cards in that cell.

#### Scenario: Board renders with existing workstreams
- **WHEN** the application loads with saved board state containing workstreams
- **THEN** the `<todo-app>` component SHALL render a `<board-header>` and one `<workstream-row>` per workstream, with cards distributed across `<status-cell>` components based on their status field

#### Scenario: Board renders empty state
- **WHEN** the application loads with no saved board state
- **THEN** the `<todo-app>` component SHALL display an empty state prompting the user to create their first workstream

### Requirement: Drag-and-drop to move cards between swimlanes
The system SHALL allow users to drag a card from one status column to another within the same workstream row. The `<status-cell>` component SHALL initialize a SortableJS instance in its `firstUpdated()` lifecycle method and destroy it in `disconnectedCallback()`. When a card is dropped in a different status column, the `<status-cell>` SHALL dispatch a `card-moved` custom event with `{ cardId, fromStatus, toStatus, newIndex }`. The `<todo-app>` component SHALL handle the event, update the card's status, and persist the change. Cards SHALL NOT be movable between different workstream rows.

#### Scenario: Move card to a different status column
- **WHEN** a user drags a card from the Backlog column to the Done column within the same workstream row
- **THEN** the `<status-cell>` SHALL dispatch a `card-moved` event, the card SHALL appear in the Done column at the drop position, and its status SHALL be updated to `done`

#### Scenario: Move card persists after page reload
- **WHEN** a user moves a card to a different status column and reloads the page
- **THEN** the card SHALL remain in the target status column

#### Scenario: Cards cannot be dragged between workstream rows
- **WHEN** a user attempts to drag a card from one workstream row to a different workstream row
- **THEN** the system SHALL prevent the drop and return the card to its original position

### Requirement: Drag-and-drop to reorder cards within a swimlane
The system SHALL allow users to drag a card within the same `<status-cell>` (same workstream and same status) to change its position relative to other cards. The `<status-cell>` SHALL dispatch a `card-moved` custom event (with matching `fromStatus` and `toStatus`) and the new order SHALL be persisted by `<todo-app>`.

#### Scenario: Reorder card within swimlane
- **WHEN** a user drags a card to a new position within the same workstream row and status column
- **THEN** the card order SHALL update to reflect the new position

### Requirement: Visual feedback during drag operations
The system SHALL provide visual feedback while a card is being dragged, including a drag ghost/preview and a drop target indicator showing where the card will land. Drag feedback CSS classes (`.card-ghost`, `.card-chosen`, `.card-drag`) SHALL be defined in `main.css` and adopted into `<todo-app>`'s shadow root via `unsafeCSS`, so they apply to the light-DOM `<status-cell>` children where SortableJS operates.

#### Scenario: Drag feedback is visible
- **WHEN** a user begins dragging a card
- **THEN** the system SHALL show a visual representation of the card following the cursor and highlight valid drop targets within the same workstream row
