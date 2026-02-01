import Sortable from 'sortablejs';
import { Priority } from '../models/types';
import type { Board, Card, Workstream } from '../models/types';
import { generateId, saveBoard } from '../storage/storage';

let currentBoard: Board;
let boardEl: HTMLElement;
let boardSortable: Sortable | null = null;
const swimlaneSortables: Map<string, Sortable> = new Map();

export function initBoard(board: Board): void {
  currentBoard = board;
  boardEl = document.getElementById('board')!;
  render();
  document.getElementById('add-workstream-btn')!.addEventListener('click', promptNewWorkstream);
}

export function getBoard(): Board {
  return currentBoard;
}

function persist(): void {
  saveBoard(currentBoard);
}

function render(): void {
  // Destroy existing sortables
  boardSortable?.destroy();
  swimlaneSortables.forEach((s) => s.destroy());
  swimlaneSortables.clear();

  boardEl.innerHTML = '';

  if (currentBoard.workstreams.length === 0) {
    renderEmptyState();
    return;
  }

  currentBoard.workstreams.forEach((ws) => {
    boardEl.appendChild(createWorkstreamColumn(ws));
  });

  // Workstream column reordering
  boardSortable = Sortable.create(boardEl, {
    animation: 150,
    handle: '.swimlane-drag-handle',
    ghostClass: 'swimlane-ghost',
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt;
      if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;
      const [moved] = currentBoard.workstreams.splice(oldIndex, 1);
      currentBoard.workstreams.splice(newIndex, 0, moved);
      persist();
    },
  });
}

function renderEmptyState(): void {
  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.innerHTML = `
    <p>No workstreams yet.</p>
    <p>Click <strong>+ New Workstream</strong> to get started.</p>
  `;
  boardEl.appendChild(empty);
}

function createWorkstreamColumn(ws: Workstream): HTMLElement {
  const col = document.createElement('div');
  col.className = 'swimlane';
  col.dataset.wsId = ws.id;

  // Header
  const header = document.createElement('div');
  header.className = 'swimlane-header';

  const dragHandle = document.createElement('span');
  dragHandle.className = 'swimlane-drag-handle';
  dragHandle.textContent = '⠿';
  dragHandle.title = 'Drag to reorder';

  const nameEl = document.createElement('span');
  nameEl.className = 'swimlane-name';
  nameEl.textContent = ws.name;
  nameEl.addEventListener('dblclick', () => startRename(ws, nameEl));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'swimlane-delete-btn';
  deleteBtn.textContent = '×';
  deleteBtn.title = 'Delete workstream';
  deleteBtn.addEventListener('click', () => deleteWorkstream(ws));

  header.appendChild(dragHandle);
  header.appendChild(nameEl);
  header.appendChild(deleteBtn);
  col.appendChild(header);

  // Card list
  const cardList = document.createElement('div');
  cardList.className = 'card-list';
  cardList.dataset.wsId = ws.id;
  ws.cards.forEach((card) => {
    cardList.appendChild(createCardElement(card, ws.id));
  });
  col.appendChild(cardList);

  // Initialize SortableJS for card drag-and-drop
  const sortable = Sortable.create(cardList, {
    group: 'cards',
    animation: 150,
    ghostClass: 'card-ghost',
    chosenClass: 'card-chosen',
    dragClass: 'card-drag',
    onEnd: (evt) => {
      const fromWsId = evt.from.dataset.wsId!;
      const toWsId = evt.to.dataset.wsId!;
      const oldIndex = evt.oldIndex!;
      const newIndex = evt.newIndex!;

      const fromWs = currentBoard.workstreams.find((w) => w.id === fromWsId)!;
      const toWs = currentBoard.workstreams.find((w) => w.id === toWsId)!;

      const [movedCard] = fromWs.cards.splice(oldIndex, 1);
      toWs.cards.splice(newIndex, 0, movedCard);
      persist();
    },
  });
  swimlaneSortables.set(ws.id, sortable);

  // Add card button
  const addCardBtn = document.createElement('button');
  addCardBtn.className = 'add-card-btn';
  addCardBtn.textContent = '+ Add Card';
  addCardBtn.addEventListener('click', () => promptNewCard(ws));
  col.appendChild(addCardBtn);

  return col;
}

function createCardElement(card: Card, wsId: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.cardId = card.id;
  el.dataset.wsId = wsId;

  if (card.priority) {
    el.classList.add(`priority-${card.priority}`);
    const badge = document.createElement('span');
    badge.className = 'priority-badge';
    badge.textContent = card.priority;
    el.appendChild(badge);
  }

  const title = document.createElement('span');
  title.className = 'card-title';
  title.textContent = card.title;
  el.appendChild(title);

  if (card.tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'card-tags';
    card.tags.forEach((tag) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.textContent = tag;
      tagsContainer.appendChild(chip);
    });
    el.appendChild(tagsContainer);
  }

  el.addEventListener('click', () => openCardEditModal(card, wsId));

  return el;
}

// ── Workstream actions ──

function promptNewWorkstream(): void {
  const name = prompt('Workstream name:');
  if (name === null) return;
  if (!name.trim()) {
    alert('Workstream name is required.');
    return;
  }
  const ws: Workstream = { id: generateId(), name: name.trim(), cards: [] };
  currentBoard.workstreams.push(ws);
  persist();
  render();
}

function startRename(ws: Workstream, nameEl: HTMLElement): void {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'rename-input';
  input.value = ws.name;

  const commit = () => {
    const val = input.value.trim();
    if (!val) {
      alert('Workstream name cannot be empty.');
      nameEl.textContent = ws.name;
    } else {
      ws.name = val;
      nameEl.textContent = val;
      persist();
    }
    input.replaceWith(nameEl);
  };

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') {
      input.value = ws.name;
      input.blur();
    }
  });

  nameEl.replaceWith(input);
  input.focus();
  input.select();
}

function deleteWorkstream(ws: Workstream): void {
  if (ws.cards.length > 0) {
    if (!confirm(`Delete "${ws.name}" and its ${ws.cards.length} card(s)?`)) return;
  }
  currentBoard.workstreams = currentBoard.workstreams.filter((w) => w.id !== ws.id);
  persist();
  render();
}

// ── Card actions ──

function promptNewCard(ws: Workstream): void {
  openCardCreateModal(ws);
}

function openCardCreateModal(ws: Workstream): void {
  const overlay = document.getElementById('modal-overlay')!;
  overlay.classList.remove('hidden');
  overlay.innerHTML = '';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <h3>New Card</h3>
    <label>Title <span class="required">*</span></label>
    <input type="text" id="modal-title" placeholder="Card title" />
    <label>Description</label>
    <textarea id="modal-desc" placeholder="Optional description"></textarea>
    <label>Priority</label>
    <select id="modal-priority">
      <option value="">None</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="urgent">Urgent</option>
    </select>
    <label>Tags <span class="hint">(comma-separated)</span></label>
    <input type="text" id="modal-tags" placeholder="e.g. frontend, bug" />
    <div class="modal-actions">
      <button id="modal-cancel" type="button">Cancel</button>
      <button id="modal-save" type="button">Create</button>
    </div>
  `;
  overlay.appendChild(modal);

  const close = () => {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  modal.querySelector('#modal-cancel')!.addEventListener('click', close);
  modal.querySelector('#modal-save')!.addEventListener('click', () => {
    const title = (modal.querySelector('#modal-title') as HTMLInputElement).value.trim();
    if (!title) {
      alert('Card title is required.');
      return;
    }
    const desc = (modal.querySelector('#modal-desc') as HTMLTextAreaElement).value;
    const prioVal = (modal.querySelector('#modal-priority') as HTMLSelectElement).value;
    const tagsVal = (modal.querySelector('#modal-tags') as HTMLInputElement).value;

    const priority = prioVal ? (prioVal as Priority) : null;
    const tags = parseTags(tagsVal);

    const card: Card = { id: generateId(), title, description: desc, priority, tags };
    ws.cards.push(card);
    persist();
    render();
    close();
  });

  (modal.querySelector('#modal-title') as HTMLInputElement).focus();
}

function openCardEditModal(card: Card, wsId: string): void {
  const overlay = document.getElementById('modal-overlay')!;
  overlay.classList.remove('hidden');
  overlay.innerHTML = '';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <h3>Edit Card</h3>
    <label>Title <span class="required">*</span></label>
    <input type="text" id="modal-title" value="${escapeHtml(card.title)}" />
    <label>Description</label>
    <textarea id="modal-desc">${escapeHtml(card.description)}</textarea>
    <label>Priority</label>
    <select id="modal-priority">
      <option value="">None</option>
      <option value="low"${card.priority === Priority.Low ? ' selected' : ''}>Low</option>
      <option value="medium"${card.priority === Priority.Medium ? ' selected' : ''}>Medium</option>
      <option value="high"${card.priority === Priority.High ? ' selected' : ''}>High</option>
      <option value="urgent"${card.priority === Priority.Urgent ? ' selected' : ''}>Urgent</option>
    </select>
    <label>Tags</label>
    <div id="modal-tags-container" class="tags-editor"></div>
    <div class="modal-actions">
      <button id="modal-delete" type="button" class="btn-danger">Delete</button>
      <button id="modal-cancel" type="button">Cancel</button>
      <button id="modal-save" type="button">Save</button>
    </div>
  `;
  overlay.appendChild(modal);

  // Tags editor
  const tagsContainer = modal.querySelector('#modal-tags-container')!;
  let editTags = [...card.tags];

  function renderTags(): void {
    tagsContainer.innerHTML = '';
    editTags.forEach((tag, i) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip removable';
      chip.textContent = tag;
      const removeBtn = document.createElement('button');
      removeBtn.className = 'tag-remove';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => {
        editTags.splice(i, 1);
        renderTags();
      });
      chip.appendChild(removeBtn);
      tagsContainer.appendChild(chip);
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tag-input';
    input.placeholder = 'Add tag...';
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = input.value.trim().replace(/,$/, '');
        if (val && !editTags.includes(val)) {
          editTags.push(val);
          renderTags();
        } else {
          input.value = '';
        }
      }
    });
    tagsContainer.appendChild(input);
  }
  renderTags();

  const close = () => {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  modal.querySelector('#modal-cancel')!.addEventListener('click', close);

  modal.querySelector('#modal-delete')!.addEventListener('click', () => {
    if (!confirm('Delete this card?')) return;
    const ws = currentBoard.workstreams.find((w) => w.id === wsId)!;
    ws.cards = ws.cards.filter((c) => c.id !== card.id);
    persist();
    render();
    close();
  });

  modal.querySelector('#modal-save')!.addEventListener('click', () => {
    const title = (modal.querySelector('#modal-title') as HTMLInputElement).value.trim();
    if (!title) {
      alert('Card title is required.');
      return;
    }
    card.title = title;
    card.description = (modal.querySelector('#modal-desc') as HTMLTextAreaElement).value;
    const prioVal = (modal.querySelector('#modal-priority') as HTMLSelectElement).value;
    card.priority = prioVal ? (prioVal as Priority) : null;
    card.tags = editTags;
    persist();
    render();
    close();
  });
}

function parseTags(input: string): string[] {
  const tags = input
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  return [...new Set(tags)];
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
