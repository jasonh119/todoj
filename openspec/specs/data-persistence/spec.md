## ADDED Requirements

### Requirement: Board state is persisted to localStorage
The system SHALL serialize the entire board state (all workstreams and their cards with ordering, priority, and tags) to JSON and store it in localStorage under a known key.

#### Scenario: State is saved after changes
- **WHEN** a user creates, edits, deletes, or moves a card or workstream
- **THEN** the updated board state SHALL be written to localStorage

#### Scenario: State includes all card fields
- **WHEN** the board state is serialized
- **THEN** each card's id, title, description, priority, and tags SHALL be included in the stored JSON

### Requirement: Board state is restored on page load
The system SHALL read the stored board state from localStorage when the application loads and restore the board to its previous state.

#### Scenario: Restore saved board
- **WHEN** the application loads and valid board state exists in localStorage
- **THEN** the board SHALL render with the saved workstreams, cards, and their ordering

#### Scenario: First load with no saved state
- **WHEN** the application loads and no board state exists in localStorage
- **THEN** the board SHALL display an empty state

### Requirement: Graceful handling of corrupted data
The system SHALL handle corrupted or invalid data in localStorage without crashing. If stored data cannot be parsed, the system SHALL fall back to an empty board state.

#### Scenario: Corrupted localStorage data
- **WHEN** the application loads and localStorage contains data that cannot be parsed as valid JSON
- **THEN** the system SHALL discard the invalid data and display an empty board

#### Scenario: Structurally invalid board data
- **WHEN** the application loads and localStorage contains valid JSON that does not match the expected board structure
- **THEN** the system SHALL discard the invalid data and display an empty board

### Requirement: Each entity has a unique identifier
The system SHALL assign a unique ID (via crypto.randomUUID) to each workstream and card upon creation. IDs SHALL remain stable across persistence cycles.

#### Scenario: IDs are stable after reload
- **WHEN** the application saves and then restores board state
- **THEN** each workstream and card SHALL retain its original ID
