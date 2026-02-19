## MODIFIED Requirements

### Requirement: Board state is persisted to localStorage
The system SHALL serialize the entire board state (all workstreams and their cards with ordering, status, priority, and tags) to JSON and store it in localStorage under a known key. The `<todo-app>` component SHALL call `saveBoard()` from `src/storage/storage.ts` whenever it handles a board-mutating event from a child component. The storage module API (`loadBoard`, `saveBoard`, `generateId`) SHALL remain unchanged.

#### Scenario: State is saved after changes
- **WHEN** a user creates, edits, deletes, or moves a card or workstream (triggering a custom event handled by `<todo-app>`)
- **THEN** the `<todo-app>` component SHALL call `saveBoard()` to write the updated board state to localStorage

#### Scenario: State includes all card fields
- **WHEN** the board state is serialized
- **THEN** each card's id, title, description, status, priority, and tags SHALL be included in the stored JSON

### Requirement: Board state is restored on page load
The system SHALL read the stored board state from localStorage when the application loads. The `main.ts` entry point SHALL call `loadBoard()` and pass the resulting `Board` object to the `<todo-app>` component as a property or attribute. The `<todo-app>` component SHALL render the restored board.

#### Scenario: Restore saved board
- **WHEN** the application loads and valid board state exists in localStorage
- **THEN** `main.ts` SHALL pass the loaded board to `<todo-app>` and the board SHALL render with the saved workstreams, cards, and their ordering

#### Scenario: First load with no saved state
- **WHEN** the application loads and no board state exists in localStorage
- **THEN** `main.ts` SHALL pass an empty board to `<todo-app>` and the board SHALL display an empty state
