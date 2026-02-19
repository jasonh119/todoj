## MODIFIED Requirements

### Requirement: Board layout displays swimlanes as columns
The system SHALL render the kanban board as a grid with workstream rows along the vertical axis and three fixed status columns (Backlog, In Progress, Done) along the horizontal axis. Each workstream SHALL be displayed as a horizontal row with its name as a label on the left. Each cell in the grid (workstream × status) SHALL display the cards belonging to that workstream with that status. The app header SHALL include a theme toggle button positioned to the left of the "+ New Workstream" button.

#### Scenario: Board renders with existing workstreams
- **WHEN** the application loads with saved board state containing workstreams
- **THEN** each workstream SHALL be displayed as a horizontal row, with cards distributed across the three status columns based on their status field

#### Scenario: Board renders empty state
- **WHEN** the application loads with no saved board state
- **THEN** the board SHALL display an empty state prompting the user to create their first workstream

#### Scenario: App header includes theme toggle
- **WHEN** the application loads
- **THEN** the app header SHALL display a theme toggle button to the left of the "+ New Workstream" button
