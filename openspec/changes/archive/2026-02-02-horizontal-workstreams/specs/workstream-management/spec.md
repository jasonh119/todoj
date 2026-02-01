## MODIFIED Requirements

### Requirement: Create a new workstream
The system SHALL allow users to create a new workstream with a user-provided name. The new workstream SHALL appear as the last row on the board with empty cells for each status column.

#### Scenario: Create workstream with valid name
- **WHEN** a user creates a new workstream with a non-empty name
- **THEN** the workstream SHALL appear as a new row at the bottom of the board with empty Backlog, In Progress, and Done cells

#### Scenario: Reject workstream with empty name
- **WHEN** a user attempts to create a workstream with an empty or whitespace-only name
- **THEN** the system SHALL not create the workstream and SHALL indicate that a name is required

### Requirement: Delete a workstream
The system SHALL allow users to delete a workstream. Deletion SHALL remove the workstream row and all of its cards across all status columns. The system SHALL require confirmation before deleting a workstream that contains cards.

#### Scenario: Delete empty workstream
- **WHEN** a user deletes a workstream that contains no cards in any status column
- **THEN** the workstream row SHALL be removed from the board

#### Scenario: Delete workstream with cards after confirmation
- **WHEN** a user requests to delete a workstream that contains cards and confirms the action
- **THEN** the workstream row and all its cards across all status columns SHALL be removed from the board and storage

#### Scenario: Cancel deletion of workstream with cards
- **WHEN** a user requests to delete a workstream that contains cards but cancels
- **THEN** the workstream and its cards SHALL remain unchanged

### Requirement: Reorder workstreams
The system SHALL allow users to reorder workstreams by dragging a workstream row to a new vertical position on the board. The new order SHALL be persisted.

#### Scenario: Drag workstream to new position
- **WHEN** a user drags a workstream row to a different vertical position
- **THEN** the board rows SHALL reorder to reflect the new position
