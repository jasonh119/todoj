import { LitElement, html } from 'lit';
import Sortable from 'sortablejs';
import type { Card, Status } from '../models/types';
import './card-element';

export class StatusCell extends LitElement {
  static properties = {
    cards: { attribute: false },
    status: { attribute: false },
    wsId: { attribute: false },
  };

  declare cards: Card[];
  declare status: Status;
  declare wsId: string;

  private _sortable: Sortable | null = null;

  // Light DOM so SortableJS can query card-element children directly
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    this._initSortable();
  }

  updated() {
    // Re-init sortable when cards change to keep it in sync
    this._destroySortable();
    this._initSortable();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._destroySortable();
  }

  private _initSortable() {
    const container = this.querySelector('.board-cell');
    if (!container) return;

    this._sortable = Sortable.create(container as HTMLElement, {
      group: `ws-${this.wsId}`,
      animation: 150,
      ghostClass: 'card-ghost',
      chosenClass: 'card-chosen',
      dragClass: 'card-drag',
      onEnd: (evt) => {
        const fromStatus = (evt.from.closest('status-cell') as StatusCell | null)?.status;
        const toStatus = (evt.to.closest('status-cell') as StatusCell | null)?.status;
        const cardId = evt.item.querySelector('card-element')?.getAttribute('data-card-id') ??
          (evt.item as HTMLElement).dataset.cardId;

        if (!fromStatus || !toStatus || !cardId) return;

        this.dispatchEvent(
          new CustomEvent('card-moved', {
            bubbles: true,
            composed: true,
            detail: {
              cardId,
              fromStatus,
              toStatus,
              newIndex: evt.newIndex ?? 0,
            },
          }),
        );
      },
    });
  }

  private _destroySortable() {
    this._sortable?.destroy();
    this._sortable = null;
  }

  render() {
    const cards = this.cards ?? [];
    return html`
      <div class="board-cell" data-ws-id=${this.wsId} data-status=${this.status}>
        ${cards.map(
          (card) =>
            html`<div data-card-id=${card.id}>
              <card-element .card=${card} .wsId=${this.wsId}></card-element>
            </div>`,
        )}
      </div>
    `;
  }
}

customElements.define('status-cell', StatusCell);
