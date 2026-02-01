## MODIFIED Requirements

### Requirement: Board layout displays swimlanes as columns
The system SHALL render the kanban board as a grid with workstream rows along the vertical axis and three fixed status columns (Backlog, In Progress, Done) along the horizontal axis. Each workstream SHALL be displayed as a horizontal row with its name as a label on the left. Each cell in the grid (workstream × status) SHALL display the cards belonging to that workstream with that status.

#### Scenario: Board renders with existing workstreams
- **WHEN** the application loads with saved board state containing workstreams
- **THEN** each workstream SHALL be displayed as a horizontal row, with cards distributed across the three status columns based on their status field

#### Scenario: Board renders empty state
- **WHEN** the application loads with no saved board state
- **THEN** the board SHALL display an empty state prompting the user to create their first workstream

### Requirement: Drag-and-drop to move cards between swimlanes
The system SHALL allow users to drag a card from one status column to another within the same workstream row. The card SHALL be removed from the source status column and inserted at the drop position in the target status column. The card's status field SHALL be updated to match the target column. The board state SHALL be persisted after every move. Cards SHALL NOT be movable between different workstream rows via drag-and-drop.

#### Scenario: Move card to a different status column
- **WHEN** a user drags a card from the Backlog column to the Done column within the same workstream row
- **THEN** the card SHALL appear in the Done column at the drop position, its status SHALL be updated to `done`, and it SHALL no longer appear in the Backlog column

#### Scenario: Move card persists after page reload
- **WHEN** a user moves a card to a different status column and reloads the page
- **THEN** the card SHALL remain in the target status column

#### Scenario: Cards cannot be dragged between workstream rows
- **WHEN** a user attempts to drag a card from one workstream row to a different workstream row
- **THEN** the system SHALL prevent the drop and return the card to its original position

### Requirement: Drag-and-drop to reorder cards within a swimlane
The system SHALL allow users to drag a card within the same cell (same workstream and same status) to change its position relative to other cards. The new order SHALL be persisted.

#### Scenario: Reorder card within swimlane
- **WHEN** a user drags a card to a new position within the same workstream row and status column
- **THEN** the card order SHALL update to reflect the new position

### Requirement: Visual feedback during drag operations
The system SHALL provide visual feedback while a card is being dragged, including a drag ghost/preview and a drop target indicator showing where the card will land.

#### Scenario: Drag feedback is visible
- **WHEN** a user begins dragging a card
- **THEN** the system SHALL show a visual representation of the card following the cursor and highlight valid drop targets within the same workstream row

## REMOVED Requirements

### Requirement: Cards are rendered within their swimlane
**Reason**: Replaced by status-columns capability. Cards are now rendered in grid cells (workstream × status) rather than within a single swimlane column.
**Migration**: Card rendering is handled by the new grid layout and status-columns spec.
