import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateId, createEmptyBoard, loadBoard, saveBoard } from './storage';
import { Status, Priority } from '../models/types';
import type { Board, Card, Workstream } from '../models/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('generateId', () => {
  it('returns a valid UUID v4 string', () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('returns unique values on successive calls', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()));
    expect(ids.size).toBe(50);
  });
});

describe('createEmptyBoard', () => {
  it('returns a board with an empty workstreams array', () => {
    const board = createEmptyBoard();
    expect(board).toEqual({ workstreams: [] });
  });

  it('returns a new object each time', () => {
    const a = createEmptyBoard();
    const b = createEmptyBoard();
    expect(a).not.toBe(b);
  });
});

describe('saveBoard / loadBoard roundtrip', () => {
  it('persists and retrieves a board with workstreams and cards', () => {
    const card: Card = {
      id: 'card-1',
      title: 'Test card',
      description: 'A description',
      status: Status.InProgress,
      priority: Priority.High,
      tags: ['frontend', 'bug'],
    };
    const ws: Workstream = { id: 'ws-1', name: 'Sprint 1', cards: [card] };
    const board: Board = { workstreams: [ws] };

    saveBoard(board);
    const loaded = loadBoard();

    expect(loaded).toEqual(board);
  });

  it('persists a board with no cards', () => {
    const board: Board = {
      workstreams: [{ id: 'ws-1', name: 'Empty WS', cards: [] }],
    };
    saveBoard(board);
    expect(loadBoard()).toEqual(board);
  });

  it('handles cards with null priority', () => {
    const board: Board = {
      workstreams: [
        {
          id: 'ws-1',
          name: 'WS',
          cards: [
            {
              id: 'c-1',
              title: 'No priority',
              description: '',
              status: Status.Backlog,
              priority: null,
              tags: [],
            },
          ],
        },
      ],
    };
    saveBoard(board);
    expect(loadBoard()).toEqual(board);
  });
});

describe('loadBoard with empty/invalid localStorage', () => {
  it('returns empty board when localStorage is empty', () => {
    expect(loadBoard()).toEqual({ workstreams: [] });
  });

  it('returns empty board when localStorage has invalid JSON', () => {
    localStorageMock.setItem('kanban-todo-board', 'not-json{{{');
    expect(loadBoard()).toEqual({ workstreams: [] });
  });

  it('returns empty board when stored value is null (key missing)', () => {
    expect(loadBoard()).toEqual({ workstreams: [] });
    expect(localStorageMock.getItem).toHaveBeenCalledWith('kanban-todo-board');
  });

  it('returns empty board when stored value is a non-object', () => {
    localStorageMock.setItem('kanban-todo-board', '"hello"');
    expect(loadBoard()).toEqual({ workstreams: [] });
  });

  it('returns empty board when workstreams is not an array', () => {
    localStorageMock.setItem(
      'kanban-todo-board',
      JSON.stringify({ workstreams: 'bad' }),
    );
    expect(loadBoard()).toEqual({ workstreams: [] });
  });
});

describe('migration: cards with missing/invalid fields', () => {
  it('defaults missing description to empty string', () => {
    const data = {
      workstreams: [
        {
          id: 'ws-1',
          name: 'WS',
          cards: [{ id: 'c-1', title: 'T', status: 'backlog' }],
        },
      ],
    };
    localStorageMock.setItem('kanban-todo-board', JSON.stringify(data));
    const board = loadBoard();
    expect(board.workstreams[0].cards[0].description).toBe('');
  });

  it('defaults invalid priority to null', () => {
    const data = {
      workstreams: [
        {
          id: 'ws-1',
          name: 'WS',
          cards: [
            { id: 'c-1', title: 'T', status: 'backlog', priority: 'bogus' },
          ],
        },
      ],
    };
    localStorageMock.setItem('kanban-todo-board', JSON.stringify(data));
    const board = loadBoard();
    expect(board.workstreams[0].cards[0].priority).toBeNull();
  });

  it('defaults invalid status to backlog', () => {
    const data = {
      workstreams: [
        {
          id: 'ws-1',
          name: 'WS',
          cards: [{ id: 'c-1', title: 'T', status: 'unknown' }],
        },
      ],
    };
    localStorageMock.setItem('kanban-todo-board', JSON.stringify(data));
    const board = loadBoard();
    expect(board.workstreams[0].cards[0].status).toBe(Status.Backlog);
  });

  it('defaults invalid tags to empty array', () => {
    const data = {
      workstreams: [
        {
          id: 'ws-1',
          name: 'WS',
          cards: [{ id: 'c-1', title: 'T', status: 'done', tags: 'not-array' }],
        },
      ],
    };
    localStorageMock.setItem('kanban-todo-board', JSON.stringify(data));
    const board = loadBoard();
    expect(board.workstreams[0].cards[0].tags).toEqual([]);
  });

  it('returns empty board when a card is missing id', () => {
    const data = {
      workstreams: [
        {
          id: 'ws-1',
          name: 'WS',
          cards: [{ title: 'No id' }],
        },
      ],
    };
    localStorageMock.setItem('kanban-todo-board', JSON.stringify(data));
    expect(loadBoard()).toEqual({ workstreams: [] });
  });

  it('returns empty board when a card is missing title', () => {
    const data = {
      workstreams: [
        {
          id: 'ws-1',
          name: 'WS',
          cards: [{ id: 'c-1' }],
        },
      ],
    };
    localStorageMock.setItem('kanban-todo-board', JSON.stringify(data));
    expect(loadBoard()).toEqual({ workstreams: [] });
  });
});

describe('migration: workstreams with missing/invalid fields', () => {
  it('returns empty board when workstream is missing id', () => {
    const data = {
      workstreams: [{ name: 'WS', cards: [] }],
    };
    localStorageMock.setItem('kanban-todo-board', JSON.stringify(data));
    expect(loadBoard()).toEqual({ workstreams: [] });
  });

  it('returns empty board when workstream is missing name', () => {
    const data = {
      workstreams: [{ id: 'ws-1', cards: [] }],
    };
    localStorageMock.setItem('kanban-todo-board', JSON.stringify(data));
    expect(loadBoard()).toEqual({ workstreams: [] });
  });

  it('returns empty board when workstream cards is not an array', () => {
    const data = {
      workstreams: [{ id: 'ws-1', name: 'WS', cards: 'nope' }],
    };
    localStorageMock.setItem('kanban-todo-board', JSON.stringify(data));
    expect(loadBoard()).toEqual({ workstreams: [] });
  });

  it('returns empty board when workstream is null', () => {
    const data = { workstreams: [null] };
    localStorageMock.setItem('kanban-todo-board', JSON.stringify(data));
    expect(loadBoard()).toEqual({ workstreams: [] });
  });
});
