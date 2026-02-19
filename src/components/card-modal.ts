import { LitElement, html, nothing } from 'lit';
import { Priority, Status, STATUS_LIST, STATUS_LABELS } from '../models/types';
import type { Card, Priority as PriorityType, Status as StatusType } from '../models/types';

export class CardModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    mode: { attribute: false },
    card: { attribute: false },
    wsId: { attribute: false },
    // internal form state
    _title: { state: true },
    _description: { state: true },
    _status: { state: true },
    _priority: { state: true },
    _tags: { state: true },
    _tagInput: { state: true },
  };

  declare open: boolean;
  declare mode: 'create' | 'edit';
  declare card: Card | null;
  declare wsId: string;
  declare _title: string;
  declare _description: string;
  declare _status: StatusType;
  declare _priority: PriorityType | null;
  declare _tags: string[];
  declare _tagInput: string;

  constructor() {
    super();
    this.open = false;
    this.mode = 'create';
    this.card = null;
    this.wsId = '';
    this._title = '';
    this._description = '';
    this._status = Status.Backlog;
    this._priority = null;
    this._tags = [];
    this._tagInput = '';
  }

  // Render into light DOM so modal overlays the full viewport
  createRenderRoot() {
    return this;
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('open') && this.open) {
      this._resetForm();
    }
  }

  private _resetForm() {
    if (this.mode === 'edit' && this.card) {
      this._title = this.card.title;
      this._description = this.card.description;
      this._status = this.card.status;
      this._priority = this.card.priority;
      this._tags = [...this.card.tags];
    } else {
      this._title = '';
      this._description = '';
      this._status = Status.Backlog;
      this._priority = null;
      this._tags = [];
    }
    this._tagInput = '';
  }

  private _close() {
    this.dispatchEvent(
      new CustomEvent('modal-closed', { bubbles: true, composed: true }),
    );
  }

  private _onOverlayClick(e: Event) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this._close();
    }
  }

  private _onSave() {
    const title = this._title.trim();
    if (!title) {
      alert('Card title is required.');
      return;
    }

    if (this.mode === 'create') {
      this.dispatchEvent(
        new CustomEvent('card-created', {
          bubbles: true,
          composed: true,
          detail: {
            wsId: this.wsId,
            title,
            description: this._description,
            status: this._status,
            priority: this._priority,
            tags: this._tags,
          },
        }),
      );
    } else {
      this.dispatchEvent(
        new CustomEvent('card-updated', {
          bubbles: true,
          composed: true,
          detail: {
            wsId: this.wsId,
            cardId: this.card!.id,
            title,
            description: this._description,
            status: this._status,
            priority: this._priority,
            tags: this._tags,
          },
        }),
      );
    }
  }

  private _onDelete() {
    if (!confirm('Delete this card?')) return;
    this.dispatchEvent(
      new CustomEvent('card-deleted', {
        bubbles: true,
        composed: true,
        detail: { wsId: this.wsId, cardId: this.card!.id },
      }),
    );
  }

  private _removeTag(index: number) {
    this._tags = this._tags.filter((_, i) => i !== index);
  }

  private _onTagKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = this._tagInput.trim().replace(/,$/, '');
      if (val && !this._tags.includes(val)) {
        this._tags = [...this._tags, val];
      }
      this._tagInput = '';
    }
  }

  render() {
    if (!this.open) return nothing;

    const isEdit = this.mode === 'edit';

    return html`
      <div class="modal-overlay" @click=${this._onOverlayClick}>
        <div class="modal">
          <h3>${isEdit ? 'Edit Card' : 'New Card'}</h3>

          <label>Title <span class="required">*</span></label>
          <input
            type="text"
            .value=${this._title}
            @input=${(e: Event) => { this._title = (e.target as HTMLInputElement).value; }}
            placeholder="Card title"
          />

          <label>Description</label>
          <textarea
            .value=${this._description}
            @input=${(e: Event) => { this._description = (e.target as HTMLTextAreaElement).value; }}
            placeholder="Optional description"
          ></textarea>

          ${isEdit
            ? html`
                <label>Status</label>
                <select
                  .value=${this._status}
                  @change=${(e: Event) => { this._status = (e.target as HTMLSelectElement).value as StatusType; }}
                >
                  ${STATUS_LIST.map(
                    (s) => html`<option value=${s} ?selected=${this._status === s}>${STATUS_LABELS[s]}</option>`,
                  )}
                </select>
              `
            : nothing}

          <label>Priority</label>
          <select
            .value=${this._priority ?? ''}
            @change=${(e: Event) => {
              const val = (e.target as HTMLSelectElement).value;
              this._priority = val ? (val as PriorityType) : null;
            }}
          >
            <option value="">None</option>
            <option value=${Priority.Low} ?selected=${this._priority === Priority.Low}>Low</option>
            <option value=${Priority.Medium} ?selected=${this._priority === Priority.Medium}>Medium</option>
            <option value=${Priority.High} ?selected=${this._priority === Priority.High}>High</option>
            <option value=${Priority.Urgent} ?selected=${this._priority === Priority.Urgent}>Urgent</option>
          </select>

          <label>Tags</label>
          <div class="tags-editor">
            ${this._tags.map(
              (tag, i) => html`
                <span class="tag-chip removable">
                  ${tag}
                  <button class="tag-remove" @click=${() => this._removeTag(i)}>×</button>
                </span>
              `,
            )}
            <input
              type="text"
              class="tag-input"
              placeholder="Add tag..."
              .value=${this._tagInput}
              @input=${(e: Event) => { this._tagInput = (e.target as HTMLInputElement).value; }}
              @keydown=${this._onTagKeydown}
            />
          </div>

          <div class="modal-actions">
            ${isEdit
              ? html`<button class="btn-danger" @click=${this._onDelete}>Delete</button>`
              : nothing}
            <button @click=${this._close}>Cancel</button>
            <button class="btn-primary" @click=${this._onSave}>
              ${isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('card-modal', CardModal);
