import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { LitElement } from 'lit';

// Mock SortableJS before importing components
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

// Mock storage module
vi.mock('../storage/storage', () => {
  let idCounter = 0;
  return {
    generateId: vi.fn(() => `test-id-${++idCounter}`),
    saveBoard: vi.fn(),
    loadBoard: vi.fn(() => ({ workstreams: [] })),
  };
});

import { Status, Priority, STATUS_LIST, STATUS_LABELS } from '../models/types';
import type { Board, Card, Workstream } from '../models/types';
import { saveBoard } from '../storage/storage';
import type { TodoApp } from './todo-app';
import './todo-app';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card-1',
    title: 'Test Card',
    description: 'A description',
    status: Status.Backlog,
    priority: Priority.Medium,
    tags: ['frontend'],
    ...overrides,
  };
}

function makeWorkstream(overrides: Partial<Workstream> = {}): Workstream {
  return {
    id: 'ws-1',
    name: 'Sprint 1',
    cards: [],
    ...overrides,
  };
}

let app: TodoApp;

async function initApp(board: Board): Promise<TodoApp> {
  document.body.innerHTML = '<todo-app></todo-app>';
  app = document.querySelector('todo-app') as TodoApp;
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
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('initBoard / todo-app', () => {
  it('renders empty state when board has no workstreams', async () => {
    await initApp({ workstreams: [] });

    const emptyState = app.shadowRoot!.querySelector('.empty-state');
    expect(emptyState).not.toBeNull();
    expect(emptyState!.textContent).toContain('No workstreams yet');
  });

  it('stores the board accessible via property', async () => {
    const board: Board = { workstreams: [] };
    await initApp(board);
    expect(app.board).toBe(board);
  });

  it('header has add-workstream button that triggers prompt', async () => {
    await initApp({ workstreams: [] });

    vi.stubGlobal('prompt', vi.fn(() => null));
    const btn = app.shadowRoot!.querySelector('.add-workstream-btn') as HTMLButtonElement;
    btn.click();
    expect(globalThis.prompt).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe('render with workstreams and cards', () => {
  it('renders status column headers via board-header', async () => {
    await initApp({ workstreams: [makeWorkstream()] });

    const boardHeader = app.shadowRoot!.querySelector('board-header');
    expect(boardHeader).not.toBeNull();
    const headers = boardHeader!.shadowRoot!.querySelectorAll('.status-col-header');
    expect(headers).toHaveLength(STATUS_LIST.length);
    headers.forEach((header, i) => {
      expect(header.textContent).toBe(STATUS_LABELS[STATUS_LIST[i]]);
    });
  });

  it('renders workstream row with name', async () => {
    const ws = makeWorkstream({ name: 'My Workstream' });
    await initApp({ workstreams: [ws] });

    const nameEl = app.shadowRoot!.querySelector('workstream-row .ws-name');
    expect(nameEl).not.toBeNull();
    expect(nameEl!.textContent).toBe('My Workstream');
  });

  it('renders cards in the correct status column', async () => {
    const card = makeCard({ status: Status.InProgress });
    const ws = makeWorkstream({ cards: [card] });
    await initApp({ workstreams: [ws] });

    const cells = app.shadowRoot!.querySelectorAll('status-cell');
    expect(cells).toHaveLength(3);
    const inProgressCell = cells[1];
    const cardEl = inProgressCell.querySelector('card-element');
    expect(cardEl).not.toBeNull();
    const title = cardEl!.shadowRoot!.querySelector('.card-title');
    expect(title!.textContent).toBe('Test Card');
  });

  it('renders priority badge when card has priority', async () => {
    const card = makeCard({ priority: Priority.High });
    const ws = makeWorkstream({ cards: [card] });
    await initApp({ workstreams: [ws] });

    const cardEl = app.shadowRoot!.querySelector('card-element');
    const badge = cardEl!.shadowRoot!.querySelector('.priority-badge');
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe('high');
  });

  it('does not render priority badge when priority is null', async () => {
    const card = makeCard({ priority: null });
    const ws = makeWorkstream({ cards: [card] });
    await initApp({ workstreams: [ws] });

    const cardEl = app.shadowRoot!.querySelector('card-element');
    const badge = cardEl!.shadowRoot!.querySelector('.priority-badge');
    expect(badge).toBeNull();
  });

  it('renders tag chips', async () => {
    const card = makeCard({ tags: ['bug', 'ui'] });
    const ws = makeWorkstream({ cards: [card] });
    await initApp({ workstreams: [ws] });

    const cardEl = app.shadowRoot!.querySelector('card-element');
    const chips = cardEl!.shadowRoot!.querySelectorAll('.tag-chip');
    expect(chips).toHaveLength(2);
    expect(chips[0].textContent).toBe('bug');
    expect(chips[1].textContent).toBe('ui');
  });

  it('renders multiple workstream rows', async () => {
    const board: Board = {
      workstreams: [
        makeWorkstream({ id: 'ws-1', name: 'WS 1' }),
        makeWorkstream({ id: 'ws-2', name: 'WS 2' }),
      ],
    };
    await initApp(board);

    const rows = app.shadowRoot!.querySelectorAll('workstream-row');
    expect(rows).toHaveLength(2);
  });

  it('renders drag handle on each workstream', async () => {
    await initApp({ workstreams: [makeWorkstream()] });
    const handle = app.shadowRoot!.querySelector('.ws-drag-handle');
    expect(handle).not.toBeNull();
  });
});

describe('card create modal', () => {
  it('opens modal when + button is clicked', async () => {
    await initApp({ workstreams: [makeWorkstream()] });

    (app.shadowRoot!.querySelector('.ws-add-card-btn') as HTMLButtonElement).click();
    const modal = await getModal();

    expect(modal.querySelector('.modal')).not.toBeNull();
    expect(modal.querySelector('h3')!.textContent).toBe('New Card');
  });

  it('closes modal on cancel', async () => {
    await initApp({ workstreams: [makeWorkstream()] });

    (app.shadowRoot!.querySelector('.ws-add-card-btn') as HTMLButtonElement).click();
    const modal = await getModal();

    // Click Cancel button (not btn-primary, not btn-danger)
    const buttons = modal.querySelectorAll('.modal-actions button');
    const cancelBtn = Array.from(buttons).find(
      (b) => !b.classList.contains('btn-primary') && !b.classList.contains('btn-danger'),
    ) as HTMLButtonElement;
    cancelBtn.click();
    await app.updateComplete;

    expect(app._modalOpen).toBe(false);
  });

  it('creates card on save with valid title', async () => {
    const ws = makeWorkstream();
    const board: Board = { workstreams: [ws] };
    await initApp(board);

    (app.shadowRoot!.querySelector('.ws-add-card-btn') as HTMLButtonElement).click();
    const modal = await getModal();

    const titleInput = modal.querySelector('input[type="text"]') as HTMLInputElement;
    titleInput.value = 'New task';
    titleInput.dispatchEvent(new Event('input'));

    const descInput = modal.querySelector('textarea') as HTMLTextAreaElement;
    descInput.value = 'Details';
    descInput.dispatchEvent(new Event('input'));

    const prioSelect = modal.querySelectorAll('select')[0] as HTMLSelectElement;
    prioSelect.value = 'high';
    prioSelect.dispatchEvent(new Event('change'));

    (modal.querySelector('.btn-primary') as HTMLButtonElement).click();
    await app.updateComplete;

    expect(app.board.workstreams[0].cards).toHaveLength(1);
    const card = app.board.workstreams[0].cards[0];
    expect(card.title).toBe('New task');
    expect(card.description).toBe('Details');
    expect(card.priority).toBe('high');
    expect(card.status).toBe(Status.Backlog);
    expect(saveBoard).toHaveBeenCalled();
  });

  it('prevents save when title is empty', async () => {
    await initApp({ workstreams: [makeWorkstream()] });
    vi.stubGlobal('alert', vi.fn());

    (app.shadowRoot!.querySelector('.ws-add-card-btn') as HTMLButtonElement).click();
    const modal = await getModal();

    (modal.querySelector('.btn-primary') as HTMLButtonElement).click();

    expect(globalThis.alert).toHaveBeenCalledWith('Card title is required.');
    vi.unstubAllGlobals();
  });
});

describe('card edit modal', () => {
  it('opens with existing card data', async () => {
    const card = makeCard({
      title: 'Existing',
      description: 'Desc',
      priority: Priority.Low,
      status: Status.Done,
      tags: ['alpha'],
    });
    const ws = makeWorkstream({ cards: [card] });
    await initApp({ workstreams: [ws] });

    const cardEl = app.shadowRoot!.querySelector('card-element');
    (cardEl!.shadowRoot!.querySelector('.card') as HTMLElement).click();
    const modal = await getModal();

    expect(modal.querySelector('h3')!.textContent).toBe('Edit Card');
    const titleInput = modal.querySelector('input[type="text"]') as HTMLInputElement;
    expect(titleInput.value).toBe('Existing');
  });

  it('saves edited card data', async () => {
    const card = makeCard({ title: 'Old Title' });
    const ws = makeWorkstream({ cards: [card] });
    await initApp({ workstreams: [ws] });

    (app.shadowRoot!.querySelector('card-element')!.shadowRoot!.querySelector('.card') as HTMLElement).click();
    const modal = await getModal();

    const titleInput = modal.querySelector('input[type="text"]') as HTMLInputElement;
    titleInput.value = 'New Title';
    titleInput.dispatchEvent(new Event('input'));

    (modal.querySelector('.btn-primary') as HTMLButtonElement).click();
    await app.updateComplete;

    expect(app.board.workstreams[0].cards[0].title).toBe('New Title');
    expect(saveBoard).toHaveBeenCalled();
  });

  it('deletes card when delete button is clicked and confirmed', async () => {
    vi.stubGlobal('confirm', vi.fn(() => true));

    const card = makeCard();
    const ws = makeWorkstream({ cards: [card] });
    await initApp({ workstreams: [ws] });

    (app.shadowRoot!.querySelector('card-element')!.shadowRoot!.querySelector('.card') as HTMLElement).click();
    const modal = await getModal();

    (modal.querySelector('.btn-danger') as HTMLButtonElement).click();
    await app.updateComplete;

    expect(app.board.workstreams[0].cards).toHaveLength(0);
    expect(saveBoard).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('does not delete card when confirm is cancelled', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false));

    const card = makeCard();
    const ws = makeWorkstream({ cards: [card] });
    await initApp({ workstreams: [ws] });

    (app.shadowRoot!.querySelector('card-element')!.shadowRoot!.querySelector('.card') as HTMLElement).click();
    const modal = await getModal();

    (modal.querySelector('.btn-danger') as HTMLButtonElement).click();

    expect(app.board.workstreams[0].cards).toHaveLength(1);
    vi.unstubAllGlobals();
  });
});

describe('workstream creation', () => {
  it('creates a new workstream via prompt', async () => {
    vi.stubGlobal('prompt', vi.fn(() => 'New WS'));
    await initApp({ workstreams: [] });

    (app.shadowRoot!.querySelector('.add-workstream-btn') as HTMLButtonElement).click();
    await app.updateComplete;

    expect(app.board.workstreams).toHaveLength(1);
    expect(app.board.workstreams[0].name).toBe('New WS');
    expect(app.board.workstreams[0].cards).toEqual([]);
    expect(saveBoard).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('does nothing when prompt is cancelled', async () => {
    vi.stubGlobal('prompt', vi.fn(() => null));
    await initApp({ workstreams: [] });

    (app.shadowRoot!.querySelector('.add-workstream-btn') as HTMLButtonElement).click();

    expect(app.board.workstreams).toHaveLength(0);
    expect(saveBoard).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('alerts when prompt returns empty string', async () => {
    vi.stubGlobal('prompt', vi.fn(() => '  '));
    vi.stubGlobal('alert', vi.fn());
    await initApp({ workstreams: [] });

    (app.shadowRoot!.querySelector('.add-workstream-btn') as HTMLButtonElement).click();

    expect(globalThis.alert).toHaveBeenCalledWith('Workstream name is required.');
    expect(app.board.workstreams).toHaveLength(0);
    vi.unstubAllGlobals();
  });
});

describe('workstream deletion', () => {
  it('deletes empty workstream without confirm', async () => {
    const ws = makeWorkstream({ cards: [] });
    await initApp({ workstreams: [ws] });

    (app.shadowRoot!.querySelector('.ws-delete-btn') as HTMLButtonElement).click();
    await app.updateComplete;

    expect(app.board.workstreams).toHaveLength(0);
    expect(saveBoard).toHaveBeenCalled();
  });

  it('prompts confirm when workstream has cards', async () => {
    vi.stubGlobal('confirm', vi.fn(() => true));

    const ws = makeWorkstream({ cards: [makeCard()] });
    await initApp({ workstreams: [ws] });

    (app.shadowRoot!.querySelector('.ws-delete-btn') as HTMLButtonElement).click();
    await app.updateComplete;

    expect(globalThis.confirm).toHaveBeenCalled();
    expect(app.board.workstreams).toHaveLength(0);
    vi.unstubAllGlobals();
  });

  it('does not delete when confirm is refused', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false));

    const ws = makeWorkstream({ cards: [makeCard()] });
    await initApp({ workstreams: [ws] });

    (app.shadowRoot!.querySelector('.ws-delete-btn') as HTMLButtonElement).click();

    expect(app.board.workstreams).toHaveLength(1);
    vi.unstubAllGlobals();
  });
});
