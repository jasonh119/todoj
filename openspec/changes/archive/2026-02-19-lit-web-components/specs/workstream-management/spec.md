## MODIFIED Requirements

### Requirement: Create a new workstream
The system SHALL allow users to create a new workstream with a user-provided name. When the user clicks the "New Workstream" button in the app header, the `<todo-app>` component SHALL prompt for a name and add the workstream to the board. The new workstream SHALL appear as a new `<workstream-row>` component at the bottom of the board with empty `<status-cell>` components for each status column.

#### Scenario: Create workstream with valid name
- **WHEN** a user creates a new workstream with a non-empty name
- **THEN** a new `<workstream-row>` SHALL appear at the bottom of the board with empty Backlog, In Progress, and Done `<status-cell>` components

#### Scenario: Reject workstream with empty name
- **WHEN** a user attempts to create a workstream with an empty or whitespace-only name
- **THEN** the system SHALL not create the workstream and SHALL indicate that a name is required

### Requirement: Rename a workstream
The system SHALL allow users to rename an existing workstream by double-clicking the workstream name in the `<workstream-row>` component. The `<workstream-row>` SHALL manage the inline rename input as part of its reactive template and dispatch a `workstream-renamed` custom event with `{ wsId, name }` on commit. The `<todo-app>` component SHALL handle the event and persist the change.

#### Scenario: Rename workstream
- **WHEN** a user double-clicks the workstream name, types a new non-empty value, and commits
- **THEN** the `<workstream-row>` SHALL dispatch a `workstream-renamed` event and the row label SHALL display the updated name

#### Scenario: Reject rename to empty name
- **WHEN** a user attempts to rename a workstream to an empty or whitespace-only name
- **THEN** the system SHALL reject the rename and keep the existing name

### Requirement: Delete a workstream
The system SHALL allow users to delete a workstream via a delete button on the `<workstream-row>` component. The row SHALL dispatch a `workstream-deleted` custom event with `{ wsId }`. The `<todo-app>` component SHALL handle deletion, removing the workstream and all of its cards. The system SHALL require confirmation before deleting a workstream that contains cards.

#### Scenario: Delete empty workstream
- **WHEN** a user deletes a workstream that contains no cards in any status column
- **THEN** the `<workstream-row>` SHALL dispatch a `workstream-deleted` event and the row SHALL be removed from the board

#### Scenario: Delete workstream with cards after confirmation
- **WHEN** a user requests to delete a workstream that contains cards and confirms the action
- **THEN** the `<workstream-row>` SHALL dispatch a `workstream-deleted` event and the row and all its cards SHALL be removed from the board and storage

#### Scenario: Cancel deletion of workstream with cards
- **WHEN** a user requests to delete a workstream that contains cards but cancels
- **THEN** the workstream and its cards SHALL remain unchanged

### Requirement: Reorder workstreams
The system SHALL allow users to reorder workstreams by dragging a `<workstream-row>` to a new vertical position on the board. The `<todo-app>` component SHALL initialize a SortableJS instance on the workstream rows container in `firstUpdated()`, using the drag handle inside each `<workstream-row>` as the handle element. On reorder, the `<todo-app>` SHALL update the workstreams array and persist the change.

#### Scenario: Drag workstream to new position
- **WHEN** a user drags a workstream row to a different vertical position using the drag handle
- **THEN** the board rows SHALL reorder to reflect the new position and the change SHALL be persisted
