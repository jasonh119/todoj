# Kanban Todo

A lightweight kanban-style todo board built with vanilla TypeScript and Vite. Organize work into horizontal workstreams with cards flowing through Backlog, In Progress, and Done columns.

## Features

- **Workstreams** - Create named workstream rows to group related work
- **Kanban columns** - Fixed Backlog, In Progress, and Done status columns
- **Drag-and-drop** - Move cards between status columns within a workstream, reorder cards within a column, and reorder workstreams
- **Priority levels** - Optional low, medium, high, and urgent priority indicators
- **Tags** - Free-form tags on any card
- **Persistent** - Board state saved to localStorage automatically

## Tech Stack

- TypeScript (vanilla, no framework)
- Vite
- SortableJS for drag-and-drop
- CSS Grid layout
- localStorage for persistence

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build

```bash
npm run build
npm run preview
```
