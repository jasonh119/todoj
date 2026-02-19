import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { LitElement } from 'lit';

// Mock SortableJS
vi.mock('sortablejs', () => {
  const createMockInstance = () => ({
    destroy: vi.fn(),
    option: vi.fn(),
    toArray: vi.fn(() => []),
    sort: vi.fn(),
    save: vi.fn(),
    closest: vi.fn(),
    el: document.createElement('div'),
  });
  const SortableMock = vi.fn(() => createMockInstance());
  (SortableMock as unknown as Record<string, unknown>).create = vi.fn(
    () => createMockInstance(),
  );
  return { default: SortableMock };
});

// Real localStorage mock
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

import { loadBoard } from './storage/storage';
import { Status } from './models/types';
import type { TodoApp } from './components/todo-app';
import './components/todo-app';

let app: TodoApp;

async function initApp(): Promise<TodoApp> {
  document.body.innerHTML = '<todo-app></todo-app>';
  app = document.querySelector('todo-app') as TodoApp;
  const board = loadBoard();
  app.board = board;
  await app.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
  return app;
}

async function getModal(): Promise<HTMLElement> {
  await app.updateComplete;
  const modal = app.shadowRoot!.querySelector('card-modal') as LitElement;
  await modal.updateComplete;
  return modal as unknown as HTMLElement;
}

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('integration: full board lifecycle', () => {
  it('init empty board -> create workstream -> add card -> edit card -> persist', async () => {
    // 1. Load empty board
    const board = loadBoard();
    expect(board.workstreams).toHaveLength(0);

    // 2. Initialize the app
    await initApp();
    const emptyState = app.shadowRoot!.querySelector('.empty-state');
    expect(emptyState).not.toBeNull();

    // 3. Create a workstream via prompt
    vi.stubGlobal('prompt', vi.fn(() => 'Integration WS'));
    (app.shadowRoot!.querySelector('.add-workstream-btn') as HTMLButtonElement).click();
    await app.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    vi.unstubAllGlobals();

    expect(app.board.workstreams).toHaveLength(1);
    expect(app.board.workstreams[0].name).toBe('Integration WS');

    // Verify empty state is gone and workstream rendered
    expect(app.shadowRoot!.querySelector('.empty-state')).toBeNull();
    expect(app.shadowRoot!.querySelector('.ws-name')!.textContent).toBe('Integration WS');

    // 4. Add a card via the create modal
    (app.shadowRoot!.querySelector('.ws-add-card-btn') as HTMLButtonElement).click();
    const modal = await getModal();

    expect(modal.querySelector('.modal')).not.toBeNull();

    const titleInput = modal.querySelector('input[type="text"]') as HTMLInputElement;
    titleInput.value = 'Integration Card';
    titleInput.dispatchEvent(new Event('input'));

    const descInput = modal.querySelector('textarea') as HTMLTextAreaElement;
    descInput.value = 'Test description';
    descInput.dispatchEvent(new Event('input'));

    const prioSelect = modal.querySelectorAll('select')[0] as HTMLSelectElement;
    prioSelect.value = 'medium';
    prioSelect.dispatchEvent(new Event('change'));

    (modal.querySelector('.btn-primary') as HTMLButtonElement).click();
    await app.updateComplete;

    // Verify card was added
    expect(app.board.workstreams[0].cards).toHaveLength(1);
    const card = app.board.workstreams[0].cards[0];
    expect(card.title).toBe('Integration Card');
    expect(card.description).toBe('Test description');
    expect(card.priority).toBe('medium');
    expect(card.status).toBe(Status.Backlog);

    // 5. Verify persistence — saveBoard was called via localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled();

    // 6. Reload from storage and verify data survived roundtrip
    const reloaded = loadBoard();
    expect(reloaded.workstreams).toHaveLength(1);
    expect(reloaded.workstreams[0].name).toBe('Integration WS');
    expect(reloaded.workstreams[0].cards).toHaveLength(1);
    expect(reloaded.workstreams[0].cards[0].title).toBe('Integration Card');
  });

  it('persistence survives multiple operations', async () => {
    await initApp();

    // Create two workstreams
    vi.stubGlobal('prompt', vi.fn()
      .mockReturnValueOnce('WS Alpha')
      .mockReturnValueOnce('WS Beta'));

    (app.shadowRoot!.querySelector('.add-workstream-btn') as HTMLButtonElement).click();
    await app.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    (app.shadowRoot!.querySelector('.add-workstream-btn') as HTMLButtonElement).click();
    await app.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    vi.unstubAllGlobals();

    expect(app.board.workstreams).toHaveLength(2);

    // Add card to first workstream
    const addBtns = app.shadowRoot!.querySelectorAll('.ws-add-card-btn');
    (addBtns[0] as HTMLButtonElement).click();
    const modal = await getModal();

    const titleInput = modal.querySelector('input[type="text"]') as HTMLInputElement;
    titleInput.value = 'Alpha Card';
    titleInput.dispatchEvent(new Event('input'));
    (modal.querySelector('.btn-primary') as HTMLButtonElement).click();
    await app.updateComplete;
    await new Promise((r) => setTimeout(r, 0));

    // Delete second workstream (no cards, no confirm needed)
    const deleteBtns = app.shadowRoot!.querySelectorAll('.ws-delete-btn');
    (deleteBtns[1] as HTMLButtonElement).click();
    await app.updateComplete;

    // Verify final state
    const final = loadBoard();
    expect(final.workstreams).toHaveLength(1);
    expect(final.workstreams[0].name).toBe('WS Alpha');
    expect(final.workstreams[0].cards).toHaveLength(1);
    expect(final.workstreams[0].cards[0].title).toBe('Alpha Card');
  });
});
