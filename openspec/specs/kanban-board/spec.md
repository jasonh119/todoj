## ADDED Requirements

### Requirement: Board layout displays swimlanes as columns
The system SHALL render the kanban board as a horizontally scrollable row of swimlane columns. Each swimlane column SHALL display its name as a header and its cards stacked vertically below.

#### Scenario: Board renders with existing workstreams
- **WHEN** the application loads with saved board state containing workstreams
- **THEN** each workstream SHALL be displayed as a column with its name and cards visible

#### Scenario: Board renders empty state
- **WHEN** the application loads with no saved board state
- **THEN** the board SHALL display an empty state prompting the user to create their first workstream

### Requirement: Cards are rendered within their swimlane
The system SHALL render each card within its parent swimlane column showing the card title. If a card has a priority set, the system SHALL display a visual priority indicator. If a card has tags, the system SHALL display them as labels on the card.

#### Scenario: Card displays with all optional fields
- **WHEN** a card has a title, priority, and tags
- **THEN** the card SHALL display the title, a priority indicator, and all tag labels

#### Scenario: Card displays with no optional fields
- **WHEN** a card has only a title (no priority, no tags)
- **THEN** the card SHALL display only the title without priority or tag elements

### Requirement: Drag-and-drop to move cards between swimlanes
The system SHALL allow users to drag a card from one swimlane and drop it into another swimlane. The card SHALL be removed from the source swimlane and inserted at the drop position in the target swimlane. The board state SHALL be persisted after every move.

#### Scenario: Move card to a different swimlane
- **WHEN** a user drags a card from swimlane A and drops it into swimlane B
- **THEN** the card SHALL appear in swimlane B at the drop position and no longer appear in swimlane A

#### Scenario: Move card persists after page reload
- **WHEN** a user moves a card to a different swimlane and reloads the page
- **THEN** the card SHALL remain in the target swimlane

### Requirement: Drag-and-drop to reorder cards within a swimlane
The system SHALL allow users to drag a card within the same swimlane to change its position relative to other cards. The new order SHALL be persisted.

#### Scenario: Reorder card within swimlane
- **WHEN** a user drags a card to a new position within the same swimlane
- **THEN** the card order SHALL update to reflect the new position

### Requirement: Visual feedback during drag operations
The system SHALL provide visual feedback while a card is being dragged, including a drag ghost/preview and a drop target indicator showing where the card will land.

#### Scenario: Drag feedback is visible
- **WHEN** a user begins dragging a card
- **THEN** the system SHALL show a visual representation of the card following the cursor and highlight valid drop targets
