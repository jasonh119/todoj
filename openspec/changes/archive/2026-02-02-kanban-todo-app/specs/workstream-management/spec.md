## ADDED Requirements

### Requirement: Create a new workstream
The system SHALL allow users to create a new workstream (swimlane) with a user-provided name. The new workstream SHALL appear as the last column on the board.

#### Scenario: Create workstream with valid name
- **WHEN** a user creates a new workstream with a non-empty name
- **THEN** the workstream SHALL appear as a new column at the end of the board with zero cards

#### Scenario: Reject workstream with empty name
- **WHEN** a user attempts to create a workstream with an empty or whitespace-only name
- **THEN** the system SHALL not create the workstream and SHALL indicate that a name is required

### Requirement: Rename a workstream
The system SHALL allow users to rename an existing workstream. The updated name SHALL be persisted.

#### Scenario: Rename workstream
- **WHEN** a user renames a workstream to a new non-empty value
- **THEN** the workstream column header SHALL display the updated name

#### Scenario: Reject rename to empty name
- **WHEN** a user attempts to rename a workstream to an empty or whitespace-only name
- **THEN** the system SHALL reject the rename and keep the existing name

### Requirement: Delete a workstream
The system SHALL allow users to delete a workstream. Deletion SHALL remove the workstream and all of its cards. The system SHALL require confirmation before deleting a workstream that contains cards.

#### Scenario: Delete empty workstream
- **WHEN** a user deletes a workstream that contains no cards
- **THEN** the workstream column SHALL be removed from the board

#### Scenario: Delete workstream with cards after confirmation
- **WHEN** a user requests to delete a workstream that contains cards and confirms the action
- **THEN** the workstream and all its cards SHALL be removed from the board and storage

#### Scenario: Cancel deletion of workstream with cards
- **WHEN** a user requests to delete a workstream that contains cards but cancels
- **THEN** the workstream and its cards SHALL remain unchanged

### Requirement: Reorder workstreams
The system SHALL allow users to reorder workstreams by dragging a swimlane column to a new position on the board. The new order SHALL be persisted.

#### Scenario: Drag workstream to new position
- **WHEN** a user drags a workstream column to a different position
- **THEN** the board columns SHALL reorder to reflect the new position
