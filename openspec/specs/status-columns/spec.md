### Requirement: Fixed status columns define the board's horizontal axis
The board SHALL display three fixed status columns: Backlog, In Progress, and Done. These columns SHALL appear in that order from left to right and SHALL NOT be user-configurable.

#### Scenario: Status columns are always visible
- **WHEN** the board renders with one or more workstreams
- **THEN** the three status column headers (Backlog, In Progress, Done) SHALL be displayed across the top of the board

#### Scenario: Status columns are present even when empty
- **WHEN** a workstream has no cards in a particular status
- **THEN** the cell for that workstream × status intersection SHALL still render as a valid drop target

### Requirement: Cards are placed in columns by their status
Each card SHALL appear in the column matching its `status` field. A card with status `backlog` SHALL appear in the Backlog column, `in-progress` in the In Progress column, and `done` in the Done column.

#### Scenario: Cards render in correct status column
- **WHEN** the board loads with cards having different statuses
- **THEN** each card SHALL appear in the column corresponding to its status value

### Requirement: Drag-and-drop changes card status
The system SHALL allow users to drag a card from one status column to another within the same workstream row. Dropping a card into a different status column SHALL update the card's `status` field to match the target column. The change SHALL be persisted immediately.

#### Scenario: Move card from Backlog to In Progress
- **WHEN** a user drags a card from the Backlog column to the In Progress column within the same workstream
- **THEN** the card's status SHALL change to `in-progress` and it SHALL appear in the In Progress column

#### Scenario: Status change persists after reload
- **WHEN** a user changes a card's status via drag-and-drop and reloads the page
- **THEN** the card SHALL remain in the status column it was moved to
