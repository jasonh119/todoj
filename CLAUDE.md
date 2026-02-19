# Kanban Todo

A lightweight kanban-style todo board built with vanilla TypeScript and Vite.

## Tech Stack

- TypeScript (vanilla, no framework)
- Vite (dev server + bundler, no custom config file)
- SortableJS for drag-and-drop
- CSS custom properties for theming
- localStorage for persistence

## Project Structure

```
src/
  main.ts              # Entry point — loads board from storage, calls initBoard
  components/board.ts  # All UI rendering, drag-and-drop, modals, workstream/card CRUD
  models/types.ts      # Type definitions: Board, Workstream, Card, Status, Priority
  storage/storage.ts   # localStorage read/write with migration/validation
  styles/main.css      # All styles, CSS custom properties in :root
index.html             # Single-page shell (#app, #board, #modal-overlay)
```

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build
```

## Conventions

- No framework — all DOM manipulation is imperative via `document.createElement`
- Board state lives in a single `Board` object; mutations call `persist()` then `render()`
- Types use `as const` object pattern (not enums): `Status`, `Priority`
- IDs generated via `crypto.randomUUID()`
- Strict TypeScript: `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- CSS uses custom properties defined in `:root` for colors, spacing, radii
- No tests currently configured
- No linter/formatter currently configured
