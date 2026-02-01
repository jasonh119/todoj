## Context

This is a greenfield project with no existing code. The goal is a simple, self-contained kanban-style todo web application. There are no backend services, databases, or existing frontend frameworks in place. The application needs to be lightweight, fast to load, and easy to run locally without complex build tooling.

## Goals / Non-Goals

**Goals:**
- Deliver a functional kanban board that runs in the browser
- Support multiple swimlanes (workstreams) with drag-and-drop card movement
- Keep the tech stack simple — minimal dependencies, fast startup
- Persist board state client-side so data survives page reloads
- Clean, responsive UI that works on desktop browsers

**Non-Goals:**
- Multi-user collaboration or real-time sync
- Backend API or server-side database
- Mobile-optimized or native app experience
- User authentication or access control
- Undo/redo history
- Card due dates, attachments, or comments (only priority and tags)

## Decisions

### 1. Framework: Vanilla TypeScript + Vite

**Choice**: Use Vite with vanilla TypeScript (no React/Vue/Angular).

**Rationale**: The user asked for a "simple" todo app. A full framework adds unnecessary weight for what is fundamentally a single-page board with drag-and-drop. Vite provides fast dev server, hot reload, and TypeScript support out of the box with zero config. If the app grows, migrating to a framework later is straightforward.

**Alternatives considered**:
- React — heavier dependency, overkill for a single-view app
- Plain HTML/JS — loses type safety and module bundling benefits

### 2. Drag-and-Drop: SortableJS

**Choice**: Use [SortableJS](https://sortablejs.github.io/Sortable/) for drag-and-drop.

**Rationale**: SortableJS is lightweight (~10KB gzipped), framework-agnostic, supports both reordering within a list and moving between lists (swimlanes), and handles touch events. The native HTML5 drag-and-drop API has inconsistent browser behavior and poor mobile support.

**Alternatives considered**:
- HTML5 native DnD — inconsistent across browsers, no built-in sortable behavior
- dnd-kit — React-specific, doesn't fit vanilla approach
- dragula — less maintained, fewer features than SortableJS

### 3. Persistence: localStorage with JSON serialization

**Choice**: Store the entire board state as a JSON blob in `localStorage`.

**Rationale**: Simplest approach for a single-user client-side app. No server needed. localStorage is synchronous, universally supported, and sufficient for the data volume of a todo board (well under the ~5MB limit). The board state (workstreams + cards) serializes cleanly to JSON.

**Alternatives considered**:
- IndexedDB — more complex API, unnecessary for small structured data
- Backend API + database — out of scope, adds deployment complexity

### 4. Data Model

The core data model uses three types:

- **Board**: Top-level container holding an ordered list of workstreams
- **Workstream**: A named swimlane containing an ordered list of cards
- **Card**: A todo item with title, optional description, optional priority (low/medium/high/urgent), and optional tags (string array)

Each entity gets a unique ID (crypto.randomUUID). Card ordering and workstream ordering are determined by array position.

### 5. Styling: Plain CSS with custom properties

**Choice**: Use vanilla CSS with CSS custom properties for theming consistency.

**Rationale**: No need for a CSS framework or preprocessor for a single-page app. Custom properties provide a clean way to manage colors and spacing. The board layout uses CSS Grid for swimlane columns and Flexbox for card stacking within each lane.

**Alternatives considered**:
- Tailwind CSS — adds build complexity and learning curve for a small app
- CSS modules — useful with frameworks, less so with vanilla TS

## Risks / Trade-offs

- **localStorage size limit** → For a todo app, the ~5MB limit is effectively unreachable. If needed in the future, migration to IndexedDB is straightforward.
- **No framework means manual DOM manipulation** → Increases code for dynamic updates, but the UI surface area is small (board, lanes, cards, modals). Keeping it vanilla avoids the dependency and complexity trade-off.
- **SortableJS is an external dependency** → Adds a dependency, but it's well-maintained and the alternative (native DnD) has significant cross-browser issues.
- **No backend means no backup/sync** → Data lives only in the browser. Clearing browser data loses everything. This is acceptable for a simple local todo tool.
