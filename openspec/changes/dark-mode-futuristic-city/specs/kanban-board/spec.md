## MODIFIED Requirements

### Requirement: Board layout displays swimlanes as columns
The system SHALL render the kanban board as a grid with workstream rows along the vertical axis and three fixed status columns (Backlog, In Progress, Done) along the horizontal axis. The board SHALL be rendered by the `<todo-app>` component, which composes a `<board-header>` component for the column headers and one `<workstream-row>` component per workstream. Each `<workstream-row>` SHALL contain one `<status-cell>` component per status column, and each `<status-cell>` SHALL render `<card-element>` components for the cards in that cell. The `<todo-app>` component's `app-header` template SHALL include a theme toggle button positioned to the left of the "+ New Workstream" button.

#### Scenario: Board renders with existing workstreams
- **WHEN** the application loads with saved board state containing workstreams
- **THEN** the `<todo-app>` component SHALL render a `<board-header>` and one `<workstream-row>` per workstream, with cards distributed across `<status-cell>` components based on their status field

#### Scenario: Board renders empty state
- **WHEN** the application loads with no saved board state
- **THEN** the `<todo-app>` component SHALL display an empty state prompting the user to create their first workstream

#### Scenario: App header includes theme toggle
- **WHEN** the application loads
- **THEN** the `<todo-app>` component's `app-header` SHALL display a theme toggle button to the left of the "+ New Workstream" button
