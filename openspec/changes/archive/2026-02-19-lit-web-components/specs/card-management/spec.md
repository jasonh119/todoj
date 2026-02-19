## MODIFIED Requirements

### Requirement: Create a new card
The system SHALL allow users to create a new card within a specific workstream. When the user clicks the add-card button on a `<workstream-row>`, the row SHALL dispatch an `open-card-modal` custom event with `{ wsId, mode: 'create' }`. The `<todo-app>` component SHALL set the `<card-modal>` component's properties to show a creation form. The `<card-modal>` SHALL dispatch a `card-created` custom event with the new card data on save. A new card MUST have a title. Priority, tags, and status are settable at creation time. If status is not specified, it SHALL default to `backlog`.

#### Scenario: Create card with title only
- **WHEN** a user creates a new card with only a title via the `<card-modal>` component
- **THEN** the `<card-modal>` SHALL dispatch a `card-created` event, and the card SHALL appear in the Backlog column of the target workstream with no priority and no tags

#### Scenario: Create card with all fields
- **WHEN** a user creates a new card with a title, priority, tags, and status via the `<card-modal>`
- **THEN** the card SHALL appear in the specified status column of the target workstream displaying the title, priority, and tags

#### Scenario: Reject card with empty title
- **WHEN** a user attempts to create a card with an empty or whitespace-only title
- **THEN** the `<card-modal>` SHALL not dispatch a `card-created` event and SHALL indicate that a title is required

### Requirement: Card display is a self-contained component
Each card SHALL be rendered as a `<card-element>` Lit component. The component SHALL accept `card` data and `wsId` as `@property()` inputs and render the card title, priority badge, and tags using a declarative Lit template. Clicking the card SHALL dispatch an `open-card-modal` custom event with `{ wsId, cardId, mode: 'edit' }`.

#### Scenario: Card element renders card data
- **WHEN** a `<card-element>` receives card data via properties
- **THEN** it SHALL render the card title, priority badge (if set), and tag chips using its Lit template

#### Scenario: Clicking card opens edit modal
- **WHEN** a user clicks on a `<card-element>`
- **THEN** the component SHALL dispatch an `open-card-modal` event with the card ID and workstream ID

### Requirement: Edit an existing card
The system SHALL allow users to edit any field on an existing card via the `<card-modal>` component: title, description, status, priority, and tags. The `<card-modal>` SHALL manage form state as `@state()` reactive properties. On save, it SHALL dispatch a `card-updated` custom event with the modified card data. Changes SHALL be persisted by `<todo-app>`.

#### Scenario: Edit card title
- **WHEN** a user edits a card's title to a new non-empty value and saves
- **THEN** the `<card-modal>` SHALL dispatch a `card-updated` event and the card SHALL display the updated title

#### Scenario: Add priority to a card
- **WHEN** a user sets the priority on a card that previously had no priority
- **THEN** the card SHALL display the selected priority indicator after save

#### Scenario: Remove priority from a card
- **WHEN** a user clears the priority on a card
- **THEN** the card SHALL no longer display a priority indicator after save

#### Scenario: Add tags to a card
- **WHEN** a user adds one or more tags to a card
- **THEN** the card SHALL display the added tag labels after save

#### Scenario: Remove a tag from a card
- **WHEN** a user removes a tag from a card
- **THEN** the removed tag SHALL no longer appear on the card after save

### Requirement: Delete a card
The system SHALL allow users to delete a card via the `<card-modal>` component. The modal SHALL dispatch a `card-deleted` custom event with `{ wsId, cardId }`. The `<todo-app>` component SHALL handle deletion from the board and persist the change. The system SHALL require confirmation before deleting.

#### Scenario: Delete card with confirmation
- **WHEN** a user requests to delete a card via the modal and confirms the action
- **THEN** the `<card-modal>` SHALL dispatch a `card-deleted` event and the card SHALL be removed from the board and storage

#### Scenario: Cancel card deletion
- **WHEN** a user requests to delete a card but cancels the confirmation
- **THEN** the card SHALL remain unchanged

### Requirement: Modal is a reusable Lit component
The `<card-modal>` SHALL be a single Lit component that handles both create and edit modes. It SHALL accept a `mode` property (`'create'` or `'edit'`), optional `card` data (for edit mode), and a `wsId` property. The modal SHALL manage its own form state via `@state()` properties. It SHALL render the tags editor with add/remove functionality as part of its template. Visibility SHALL be controlled by an `open` boolean property.

#### Scenario: Modal renders in create mode
- **WHEN** the `<card-modal>` has `mode="create"` and `open=true`
- **THEN** it SHALL render an empty form with title, description, priority, and tags fields, and a "Create" submit button

#### Scenario: Modal renders in edit mode
- **WHEN** the `<card-modal>` has `mode="edit"`, `open=true`, and card data set
- **THEN** it SHALL render the form pre-filled with the card's current values, a status selector, a "Save" submit button, and a "Delete" button

#### Scenario: Modal closes on overlay click
- **WHEN** the user clicks the overlay area outside the modal
- **THEN** the `<card-modal>` SHALL dispatch a `modal-closed` event and `<todo-app>` SHALL set `open=false`
