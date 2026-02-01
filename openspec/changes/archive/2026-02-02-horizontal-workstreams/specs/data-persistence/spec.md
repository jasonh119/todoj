## MODIFIED Requirements

### Requirement: Board state is persisted to localStorage
The system SHALL serialize the entire board state (all workstreams and their cards with ordering, status, priority, and tags) to JSON and store it in localStorage under a known key.

#### Scenario: State is saved after changes
- **WHEN** a user creates, edits, deletes, or moves a card or workstream
- **THEN** the updated board state SHALL be written to localStorage

#### Scenario: State includes all card fields
- **WHEN** the board state is serialized
- **THEN** each card's id, title, description, status, priority, and tags SHALL be included in the stored JSON

## ADDED Requirements

### Requirement: Migration of legacy data without status field
The system SHALL handle board data from the previous schema where cards do not have a `status` field. When loading a card without a `status` field, the system SHALL assign `backlog` as the default status.

#### Scenario: Load legacy card without status
- **WHEN** the application loads board state containing a card with no `status` field
- **THEN** the card SHALL be assigned status `backlog` and appear in the Backlog column

#### Scenario: Legacy data is re-saved with status
- **WHEN** the application loads and migrates legacy data
- **THEN** the next save SHALL include the `status` field on all cards

### Requirement: Validation includes status field
The storage validation logic SHALL verify that each card's `status` field contains a valid status value (`backlog`, `in-progress`, or `done`). Cards with an invalid or missing status SHALL be assigned `backlog` during validation.

#### Scenario: Invalid status value is corrected
- **WHEN** the application loads board state containing a card with an unrecognized status value
- **THEN** the card SHALL be assigned status `backlog`
