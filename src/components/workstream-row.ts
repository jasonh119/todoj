import { LitElement, html } from 'lit';
import { STATUS_LIST } from '../models/types';
import type { Workstream } from '../models/types';
import './status-cell';

export class WorkstreamRow extends LitElement {
  static properties = {
    workstream: { attribute: false },
    _editing: { state: true },
    _editName: { state: true },
  };

  declare workstream: Workstream;
  declare _editing: boolean;
  declare _editName: string;

  constructor() {
    super();
    this._editing = false;
    this._editName = '';
  }

  // Opt out of Shadow DOM so SortableJS can find .ws-row and .ws-drag-handle
  createRenderRoot() {
    return this;
  }

  private _startRename() {
    this._editing = true;
    this._editName = this.workstream.name;
    this.updateComplete.then(() => {
      const input = this.querySelector('.rename-input') as HTMLInputElement | null;
      input?.focus();
      input?.select();
    });
  }

  private _commitRename() {
    const val = this._editName.trim();
    if (!val) {
      alert('Workstream name cannot be empty.');
    } else if (val !== this.workstream.name) {
      this.dispatchEvent(
        new CustomEvent('workstream-renamed', {
          bubbles: true,
          composed: true,
          detail: { wsId: this.workstream.id, name: val },
        }),
      );
    }
    this._editing = false;
  }

  private _onRenameKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      this._editName = this.workstream.name;
      (e.target as HTMLInputElement).blur();
    }
  }

  private _onDelete() {
    const ws = this.workstream;
    if (ws.cards.length > 0) {
      if (!confirm(`Delete "${ws.name}" and its ${ws.cards.length} card(s)?`)) return;
    }
    this.dispatchEvent(
      new CustomEvent('workstream-deleted', {
        bubbles: true,
        composed: true,
        detail: { wsId: ws.id },
      }),
    );
  }

  private _onAddCard() {
    this.dispatchEvent(
      new CustomEvent('open-card-modal', {
        bubbles: true,
        composed: true,
        detail: { wsId: this.workstream.id, mode: 'create' },
      }),
    );
  }

  render() {
    const ws = this.workstream;
    if (!ws) return html``;

    return html`
      <div class="ws-row" data-ws-id=${ws.id}>
        <div class="ws-label">
          <span class="ws-drag-handle" title="Drag to reorder">⠿</span>
          ${this._editing
            ? html`
                <input
                  type="text"
                  class="rename-input"
                  .value=${this._editName}
                  @input=${(e: Event) => { this._editName = (e.target as HTMLInputElement).value; }}
                  @blur=${this._commitRename}
                  @keydown=${this._onRenameKeydown}
                />
              `
            : html`
                <span class="ws-name" @dblclick=${this._startRename}>${ws.name}</span>
              `}
          <div class="ws-actions">
            <button class="ws-add-card-btn" title="Add card" @click=${this._onAddCard}>+</button>
            <button class="ws-delete-btn" title="Delete workstream" @click=${this._onDelete}>×</button>
          </div>
        </div>
        ${STATUS_LIST.map((status) => {
          const cards = ws.cards.filter((c) => c.status === status);
          return html`
            <status-cell
              .cards=${cards}
              .status=${status}
              .wsId=${ws.id}
            ></status-cell>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('workstream-row', WorkstreamRow);
