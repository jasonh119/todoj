import { Priority, Status } from '../models/types';
import type { Board, Card, Workstream } from '../models/types';

const STORAGE_KEY = 'kanban-todo-board';

export function generateId(): string {
  return crypto.randomUUID();
}

const PRIORITY_VALUES: readonly string[] = Object.values(Priority);
const STATUS_VALUES: readonly string[] = Object.values(Status);

function isValidPriority(value: unknown): value is Priority | null {
  if (value === null) return true;
  return typeof value === 'string' && PRIORITY_VALUES.includes(value);
}

function isValidStatus(value: unknown): value is Status {
  return typeof value === 'string' && STATUS_VALUES.includes(value);
}

function migrateCard(obj: Record<string, unknown>): Card | null {
  if (typeof obj.id !== 'string' || typeof obj.title !== 'string') return null;

  const description = typeof obj.description === 'string' ? obj.description : '';
  const priority = isValidPriority(obj.priority) ? obj.priority : null;
  const tags =
    Array.isArray(obj.tags) && obj.tags.every((t: unknown) => typeof t === 'string')
      ? (obj.tags as string[])
      : [];
  const status = isValidStatus(obj.status) ? obj.status : Status.Backlog;

  return { id: obj.id, title: obj.title, description, status, priority, tags };
}

function migrateWorkstream(value: unknown): Workstream | null {
  if (typeof value !== 'object' || value === null) return null;
  const obj = value as Record<string, unknown>;
  if (typeof obj.id !== 'string' || typeof obj.name !== 'string') return null;
  if (!Array.isArray(obj.cards)) return null;

  const cards: Card[] = [];
  for (const raw of obj.cards) {
    if (typeof raw !== 'object' || raw === null) return null;
    const card = migrateCard(raw as Record<string, unknown>);
    if (!card) return null;
    cards.push(card);
  }

  return { id: obj.id, name: obj.name, cards };
}

function migrateBoard(value: unknown): Board | null {
  if (typeof value !== 'object' || value === null) return null;
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj.workstreams)) return null;

  const workstreams: Workstream[] = [];
  for (const raw of obj.workstreams) {
    const ws = migrateWorkstream(raw);
    if (!ws) return null;
    workstreams.push(ws);
  }

  return { workstreams };
}

export function createEmptyBoard(): Board {
  return { workstreams: [] };
}

export function loadBoard(): Board {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return createEmptyBoard();
    const parsed = JSON.parse(raw);
    const board = migrateBoard(parsed);
    return board ?? createEmptyBoard();
  } catch {
    return createEmptyBoard();
  }
}

export function saveBoard(board: Board): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}
