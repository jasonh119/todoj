import Sortable from 'sortablejs';
import { Priority, Status, STATUS_LIST, STATUS_LABELS } from '../models/types';
import type { Board, Card, Status as StatusType, Workstream } from '../models/types';
import { generateId, saveBoard } from '../storage/storage';

let currentBoard: Board;
let boardEl: HTMLElement;
let rowsSortable: Sortable | null = null;
const cellSortables: Sortable[] = [];

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
  rowsSortable?.destroy();
  cellSortables.forEach((s) => s.destroy());
  cellSortables.length = 0;

  boardEl.innerHTML = '';

  if (currentBoard.workstreams.length === 0) {
    renderEmptyState();
    return;
  }

  // Status column headers
  const headerRow = document.createElement('div');
  headerRow.className = 'board-header-row';
  const labelSpacer = document.createElement('div');
  labelSpacer.className = 'ws-label-spacer';
  headerRow.appendChild(labelSpacer);
  for (const status of STATUS_LIST) {
    const colHeader = document.createElement('div');
    colHeader.className = 'status-col-header';
    colHeader.textContent = STATUS_LABELS[status];
    headerRow.appendChild(colHeader);
  }
  boardEl.appendChild(headerRow);

  // Workstream rows container (sortable for row reordering)
  const rowsContainer = document.createElement('div');
  rowsContainer.className = 'ws-rows-container';

  currentBoard.workstreams.forEach((ws) => {
    rowsContainer.appendChild(createWorkstreamRow(ws));
  });

  boardEl.appendChild(rowsContainer);

  // Workstream row reordering
  rowsSortable = Sortable.create(rowsContainer, {
    animation: 150,
    handle: '.ws-drag-handle',
    ghostClass: 'ws-row-ghost',
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

function createWorkstreamRow(ws: Workstream): HTMLElement {
  const row = document.createElement('div');
  row.className = 'ws-row';
  row.dataset.wsId = ws.id;

  // Row label
  const label = document.createElement('div');
  label.className = 'ws-label';

  const dragHandle = document.createElement('span');
  dragHandle.className = 'ws-drag-handle';
  dragHandle.textContent = '⠿';
  dragHandle.title = 'Drag to reorder';

  const nameEl = document.createElement('span');
  nameEl.className = 'ws-name';
  nameEl.textContent = ws.name;
  nameEl.addEventListener('dblclick', () => startRename(ws, nameEl));

  const actions = document.createElement('div');
  actions.className = 'ws-actions';

  const addBtn = document.createElement('button');
  addBtn.className = 'ws-add-card-btn';
  addBtn.textContent = '+';
  addBtn.title = 'Add card';
  addBtn.addEventListener('click', () => openCardCreateModal(ws));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'ws-delete-btn';
  deleteBtn.textContent = '×';
  deleteBtn.title = 'Delete workstream';
  deleteBtn.addEventListener('click', () => deleteWorkstream(ws));

  actions.appendChild(addBtn);
  actions.appendChild(deleteBtn);

  label.appendChild(dragHandle);
  label.appendChild(nameEl);
  label.appendChild(actions);
  row.appendChild(label);

  // One cell per status column
  for (const status of STATUS_LIST) {
    const cell = document.createElement('div');
    cell.className = 'board-cell';
    cell.dataset.wsId = ws.id;
    cell.dataset.status = status;

    const cardsForCell = ws.cards.filter((c) => c.status === status);
    cardsForCell.forEach((card) => {
      cell.appendChild(createCardElement(card, ws.id));
    });

    row.appendChild(cell);

    // SortableJS per cell, grouped by workstream row
    const sortable = Sortable.create(cell, {
      group: `ws-${ws.id}`,
      animation: 150,
      ghostClass: 'card-ghost',
      chosenClass: 'card-chosen',
      dragClass: 'card-drag',
      onEnd: (evt) => {
        const fromStatus = evt.from.dataset.status as StatusType;
        const toStatus = evt.to.dataset.status as StatusType;
        const oldIndex = evt.oldIndex!;
        const newIndex = evt.newIndex!;

        // Get cards by status to find the moved card
        const fromCards = ws.cards.filter((c) => c.status === fromStatus);
        const movedCard = fromCards[oldIndex];

        if (fromStatus !== toStatus) {
          movedCard.status = toStatus;
        }

        // Rebuild card order: remove moved card, then reinsert at correct position
        ws.cards = ws.cards.filter((c) => c.id !== movedCard.id);

        // Find insertion point among cards with the target status
        const targetCards = ws.cards.filter((c) => c.status === toStatus);
        if (newIndex >= targetCards.length) {
          // Insert after the last card with this status
          const lastIdx =
            targetCards.length > 0
              ? ws.cards.indexOf(targetCards[targetCards.length - 1]) + 1
              : ws.cards.length;
          ws.cards.splice(lastIdx, 0, movedCard);
        } else {
          const insertBefore = targetCards[newIndex];
          const insertIdx = ws.cards.indexOf(insertBefore);
          ws.cards.splice(insertIdx, 0, movedCard);
        }

        persist();
      },
    });
    cellSortables.push(sortable);
  }

  return row;
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

    const card: Card = {
      id: generateId(),
      title,
      description: desc,
      status: Status.Backlog,
      priority,
      tags,
    };
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

  const statusOptions = STATUS_LIST.map(
    (s) => `<option value="${s}"${card.status === s ? ' selected' : ''}>${STATUS_LABELS[s]}</option>`,
  ).join('');

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <h3>Edit Card</h3>
    <label>Title <span class="required">*</span></label>
    <input type="text" id="modal-title" value="${escapeHtml(card.title)}" />
    <label>Description</label>
    <textarea id="modal-desc">${escapeHtml(card.description)}</textarea>
    <label>Status</label>
    <select id="modal-status">${statusOptions}</select>
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
    card.status = (modal.querySelector('#modal-status') as HTMLSelectElement).value as StatusType;
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
