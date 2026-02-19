import { LitElement, html, css, unsafeCSS } from 'lit';
import Sortable from 'sortablejs';
import type { Board, Card, Status as StatusType } from '../models/types';
import { generateId, saveBoard } from '../storage/storage';
import { Status } from '../models/types';
import './board-header';
import './workstream-row';
import './card-modal';

// Import global CSS as text so light-DOM children inside this shadow root get styled
import mainCssText from '../styles/main.css?inline';

export class TodoApp extends LitElement {
  static properties = {
    board: { attribute: false },
    _modalOpen: { state: true },
    _modalMode: { state: true },
    _modalCard: { state: true },
    _modalWsId: { state: true },
  };

  declare board: Board;
  declare _modalOpen: boolean;
  declare _modalMode: 'create' | 'edit';
  declare _modalCard: Card | null;
  declare _modalWsId: string;

  private _rowsSortable: Sortable | null = null;

  constructor() {
    super();
    this.board = { workstreams: [] };
    this._modalOpen = false;
    this._modalMode = 'create';
    this._modalCard = null;
    this._modalWsId = '';
  }

  static styles = [unsafeCSS(mainCssText), css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-lg) var(--spacing-xl);
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }

    .app-header h1 {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .add-workstream-btn {
      padding: var(--spacing-sm) var(--spacing-lg);
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--radius);
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .add-workstream-btn:hover {
      background: var(--accent-hover);
    }

    .board {
      flex: 1;
      overflow: auto;
      padding: var(--spacing-xl);
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .ws-rows-container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .ws-row-ghost {
      opacity: 0.4;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      width: 100%;
      padding: var(--spacing-xl);
      color: var(--text-secondary);
      text-align: center;
    }
  `];

  private _persist() {
    saveBoard(this.board);
    this.requestUpdate();
  }

  // ── Workstream handlers ──

  private _addWorkstream() {
    const name = prompt('Workstream name:');
    if (name === null) return;
    if (!name.trim()) {
      alert('Workstream name is required.');
      return;
    }
    this.board.workstreams.push({
      id: generateId(),
      name: name.trim(),
      cards: [],
    });
    this._persist();
  }

  private _onWorkstreamRenamed(e: CustomEvent) {
    const { wsId, name } = e.detail;
    const ws = this.board.workstreams.find((w) => w.id === wsId);
    if (ws) {
      ws.name = name;
      this._persist();
    }
  }

  private _onWorkstreamDeleted(e: CustomEvent) {
    const { wsId } = e.detail;
    this.board.workstreams = this.board.workstreams.filter((w) => w.id !== wsId);
    this._persist();
  }

  // ── Card handlers ──

  private _onCardCreated(e: CustomEvent) {
    const { wsId, title, description, status, priority, tags } = e.detail;
    const ws = this.board.workstreams.find((w) => w.id === wsId);
    if (!ws) return;

    const card: Card = {
      id: generateId(),
      title,
      description,
      status: status ?? Status.Backlog,
      priority: priority ?? null,
      tags: tags ?? [],
    };
    ws.cards.push(card);
    this._modalOpen = false;
    this._persist();
  }

  private _onCardUpdated(e: CustomEvent) {
    const { wsId, cardId, title, description, status, priority, tags } = e.detail;
    const ws = this.board.workstreams.find((w) => w.id === wsId);
    if (!ws) return;

    const card = ws.cards.find((c) => c.id === cardId);
    if (!card) return;

    card.title = title;
    card.description = description;
    card.status = status;
    card.priority = priority;
    card.tags = tags;
    this._modalOpen = false;
    this._persist();
  }

  private _onCardDeleted(e: CustomEvent) {
    const { wsId, cardId } = e.detail;
    const ws = this.board.workstreams.find((w) => w.id === wsId);
    if (!ws) return;

    ws.cards = ws.cards.filter((c) => c.id !== cardId);
    this._modalOpen = false;
    this._persist();
  }

  private _onCardMoved(e: CustomEvent) {
    const { cardId, fromStatus, toStatus, newIndex } = e.detail;
    // Find which workstream owns this card
    for (const ws of this.board.workstreams) {
      const card = ws.cards.find((c) => c.id === cardId);
      if (!card) continue;

      if (fromStatus !== toStatus) {
        card.status = toStatus as StatusType;
      }

      // Rebuild card order
      ws.cards = ws.cards.filter((c) => c.id !== card.id);
      const targetCards = ws.cards.filter((c) => c.status === toStatus);
      if (newIndex >= targetCards.length) {
        const lastIdx =
          targetCards.length > 0
            ? ws.cards.indexOf(targetCards[targetCards.length - 1]) + 1
            : ws.cards.length;
        ws.cards.splice(lastIdx, 0, card);
      } else {
        const insertBefore = targetCards[newIndex];
        const insertIdx = ws.cards.indexOf(insertBefore);
        ws.cards.splice(insertIdx, 0, card);
      }

      this._persist();
      break;
    }
  }

  // ── Modal handlers ──

  private _onOpenCardModal(e: CustomEvent) {
    const { wsId, cardId, mode } = e.detail;
    this._modalWsId = wsId;
    this._modalMode = mode;

    if (mode === 'edit' && cardId) {
      const ws = this.board.workstreams.find((w) => w.id === wsId);
      this._modalCard = ws?.cards.find((c) => c.id === cardId) ?? null;
    } else {
      this._modalCard = null;
    }

    this._modalOpen = true;
  }

  private _onModalClosed() {
    this._modalOpen = false;
  }

  // ── SortableJS for row reordering ──

  firstUpdated() {
    this._initRowsSortable();
  }

  updated() {
    this._destroyRowsSortable();
    this._initRowsSortable();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._destroyRowsSortable();
  }

  private _initRowsSortable() {
    const container = this.renderRoot.querySelector('.ws-rows-container');
    if (!container) return;

    this._rowsSortable = Sortable.create(container as HTMLElement, {
      animation: 150,
      handle: '.ws-drag-handle',
      ghostClass: 'ws-row-ghost',
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;
        if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;
        const [moved] = this.board.workstreams.splice(oldIndex, 1);
        this.board.workstreams.splice(newIndex, 0, moved);
        this._persist();
      },
    });
  }

  private _destroyRowsSortable() {
    this._rowsSortable?.destroy();
    this._rowsSortable = null;
  }

  render() {
    const hasWorkstreams = this.board.workstreams.length > 0;

    return html`
      <header class="app-header">
        <h1>Kanban Todo</h1>
        <button class="add-workstream-btn" @click=${this._addWorkstream}>
          + New Workstream
        </button>
      </header>

      <div
        class="board"
        @workstream-renamed=${this._onWorkstreamRenamed}
        @workstream-deleted=${this._onWorkstreamDeleted}
        @card-moved=${this._onCardMoved}
        @open-card-modal=${this._onOpenCardModal}
      >
        ${hasWorkstreams
          ? html`
              <board-header></board-header>
              <div class="ws-rows-container">
                ${this.board.workstreams.map(
                  (ws) => html`
                    <workstream-row .workstream=${ws}></workstream-row>
                  `,
                )}
              </div>
            `
          : html`
              <div class="empty-state">
                <p>No workstreams yet.</p>
                <p>Click <strong>+ New Workstream</strong> to get started.</p>
              </div>
            `}
      </div>

      <card-modal
        .open=${this._modalOpen}
        .mode=${this._modalMode}
        .card=${this._modalCard}
        .wsId=${this._modalWsId}
        @card-created=${this._onCardCreated}
        @card-updated=${this._onCardUpdated}
        @card-deleted=${this._onCardDeleted}
        @modal-closed=${this._onModalClosed}
      ></card-modal>
    `;
  }
}

customElements.define('todo-app', TodoApp);
