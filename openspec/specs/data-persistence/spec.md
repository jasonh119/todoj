### Requirement: Board state is persisted to localStorage
The system SHALL serialize the entire board state (all workstreams and their cards with ordering, status, priority, and tags) to JSON and store it in localStorage under a known key. The `<todo-app>` component SHALL call `saveBoard()` from `src/storage/storage.ts` whenever it handles a board-mutating event from a child component. The storage module API (`loadBoard`, `saveBoard`, `generateId`) SHALL remain unchanged.

#### Scenario: State is saved after changes
- **WHEN** a user creates, edits, deletes, or moves a card or workstream (triggering a custom event handled by `<todo-app>`)
- **THEN** the `<todo-app>` component SHALL call `saveBoard()` to write the updated board state to localStorage

#### Scenario: State includes all card fields
- **WHEN** the board state is serialized
- **THEN** each card's id, title, description, status, priority, and tags SHALL be included in the stored JSON

### Requirement: Board state is restored on page load
The system SHALL read the stored board state from localStorage when the application loads. The `main.ts` entry point SHALL call `loadBoard()` and pass the resulting `Board` object to the `<todo-app>` component as a property. The `<todo-app>` component SHALL render the restored board.

#### Scenario: Restore saved board
- **WHEN** the application loads and valid board state exists in localStorage
- **THEN** `main.ts` SHALL pass the loaded board to `<todo-app>` and the board SHALL render with the saved workstreams, cards, and their ordering

#### Scenario: First load with no saved state
- **WHEN** the application loads and no board state exists in localStorage
- **THEN** `main.ts` SHALL pass an empty board to `<todo-app>` and the board SHALL display an empty state

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
