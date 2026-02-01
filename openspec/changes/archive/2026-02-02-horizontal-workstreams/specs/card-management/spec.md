## ADDED Requirements

### Requirement: Cards have a status field
Every card SHALL have a `status` field with one of three values: `backlog`, `in-progress`, or `done`. The status field is required and SHALL default to `backlog` when a new card is created.

#### Scenario: New card defaults to backlog
- **WHEN** a user creates a new card without specifying a status
- **THEN** the card SHALL be created with status `backlog` and appear in the Backlog column

### Requirement: Card status can be edited in the edit modal
The card edit modal SHALL include a status selector allowing the user to change the card's status to any of the three values (Backlog, In Progress, Done).

#### Scenario: Change card status via edit modal
- **WHEN** a user opens a card's edit modal and changes the status from Backlog to Done
- **THEN** the card SHALL move to the Done column of its workstream after saving

## MODIFIED Requirements

### Requirement: Create a new card
The system SHALL allow users to create a new card within a specific workstream. A new card MUST have a title. Priority, tags, and status are settable at creation time. If status is not specified, it SHALL default to `backlog`.

#### Scenario: Create card with title only
- **WHEN** a user creates a new card with only a title
- **THEN** the card SHALL appear in the Backlog column of the target workstream with no priority and no tags

#### Scenario: Create card with all fields
- **WHEN** a user creates a new card with a title, priority, tags, and status
- **THEN** the card SHALL appear in the specified status column of the target workstream displaying the title, priority, and tags

#### Scenario: Reject card with empty title
- **WHEN** a user attempts to create a card with an empty or whitespace-only title
- **THEN** the system SHALL not create the card and SHALL indicate that a title is required
