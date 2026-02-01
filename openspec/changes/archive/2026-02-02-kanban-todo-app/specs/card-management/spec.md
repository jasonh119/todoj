## ADDED Requirements

### Requirement: Create a new card
The system SHALL allow users to create a new card within a specific swimlane. A new card MUST have a title. Priority and tags are optional at creation time.

#### Scenario: Create card with title only
- **WHEN** a user creates a new card with only a title
- **THEN** the card SHALL appear at the bottom of the target swimlane with no priority and no tags

#### Scenario: Create card with all fields
- **WHEN** a user creates a new card with a title, priority, and tags
- **THEN** the card SHALL appear at the bottom of the target swimlane displaying the title, priority, and tags

#### Scenario: Reject card with empty title
- **WHEN** a user attempts to create a card with an empty or whitespace-only title
- **THEN** the system SHALL not create the card and SHALL indicate that a title is required

### Requirement: Edit an existing card
The system SHALL allow users to edit any field on an existing card: title, description, priority, and tags. Changes SHALL be persisted immediately.

#### Scenario: Edit card title
- **WHEN** a user edits a card's title to a new non-empty value
- **THEN** the card SHALL display the updated title

#### Scenario: Add priority to a card
- **WHEN** a user sets the priority on a card that previously had no priority
- **THEN** the card SHALL display the selected priority indicator

#### Scenario: Remove priority from a card
- **WHEN** a user clears the priority on a card
- **THEN** the card SHALL no longer display a priority indicator

#### Scenario: Add tags to a card
- **WHEN** a user adds one or more tags to a card
- **THEN** the card SHALL display the added tag labels

#### Scenario: Remove a tag from a card
- **WHEN** a user removes a tag from a card
- **THEN** the removed tag SHALL no longer appear on the card

### Requirement: Delete a card
The system SHALL allow users to delete a card. Deletion SHALL remove the card from its swimlane and from persisted state. The system SHALL require confirmation before deleting.

#### Scenario: Delete card with confirmation
- **WHEN** a user requests to delete a card and confirms the action
- **THEN** the card SHALL be removed from the swimlane and from storage

#### Scenario: Cancel card deletion
- **WHEN** a user requests to delete a card but cancels the confirmation
- **THEN** the card SHALL remain unchanged

### Requirement: Priority values
The system SHALL support four priority levels: low, medium, high, and urgent. Each priority level SHALL have a distinct visual style (color or icon). Priority is optional — cards with no priority set SHALL display without a priority indicator.

#### Scenario: Each priority level is visually distinct
- **WHEN** cards with different priority levels are displayed
- **THEN** each priority level SHALL have a visually distinguishable indicator

### Requirement: Tags are free-form strings
Tags SHALL be free-form user-defined strings. A card MAY have zero or more tags. Duplicate tags on the same card SHALL not be allowed.

#### Scenario: Add duplicate tag
- **WHEN** a user attempts to add a tag that already exists on the card
- **THEN** the system SHALL not add the duplicate tag
