import { Priority } from '../models/types';
import type { Board, Card, Workstream } from '../models/types';

const STORAGE_KEY = 'kanban-todo-board';

export function generateId(): string {
  return crypto.randomUUID();
}

const PRIORITY_VALUES: readonly string[] = Object.values(Priority);

function isValidPriority(value: unknown): value is Priority | null {
  if (value === null) return true;
  return typeof value === 'string' && PRIORITY_VALUES.includes(value);
}

function isValidCard(value: unknown): value is Card {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    isValidPriority(obj.priority) &&
    Array.isArray(obj.tags) &&
    obj.tags.every((t: unknown) => typeof t === 'string')
  );
}

function isValidWorkstream(value: unknown): value is Workstream {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.cards) &&
    obj.cards.every(isValidCard)
  );
}

function isValidBoard(value: unknown): value is Board {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    Array.isArray(obj.workstreams) &&
    obj.workstreams.every(isValidWorkstream)
  );
}

export function createEmptyBoard(): Board {
  return { workstreams: [] };
}

export function loadBoard(): Board {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return createEmptyBoard();
    const parsed = JSON.parse(raw);
    if (!isValidBoard(parsed)) return createEmptyBoard();
    return parsed;
  } catch {
    return createEmptyBoard();
  }
}

export function saveBoard(board: Board): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}
