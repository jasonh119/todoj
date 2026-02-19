import { LitElement, html, css, nothing } from 'lit';
import type { Card } from '../models/types';

export class CardElement extends LitElement {
  static properties = {
    card: { attribute: false },
    wsId: { attribute: false },
  };

  declare card: Card;
  declare wsId: string;

  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: var(--spacing-md);
      cursor: pointer;
      transition: box-shadow 0.15s, border-color 0.15s;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .card:hover {
      border-color: var(--accent);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .card-title {
      font-size: 0.825rem;
      font-weight: 500;
    }

    .priority-badge {
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px var(--spacing-sm);
      border-radius: var(--radius-sm);
      color: white;
      align-self: flex-start;
    }

    .priority-low .priority-badge {
      background: var(--priority-low);
    }

    .priority-medium .priority-badge {
      background: var(--priority-medium);
      color: var(--text);
    }

    .priority-high .priority-badge {
      background: var(--priority-high);
    }

    .priority-urgent .priority-badge {
      background: var(--priority-urgent);
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-xs);
    }

    .tag-chip {
      font-size: 0.65rem;
      padding: 2px var(--spacing-sm);
      background: var(--border);
      border-radius: 999px;
      color: var(--text-secondary);
      white-space: nowrap;
    }
  `;

  private _onClick() {
    this.dispatchEvent(
      new CustomEvent('open-card-modal', {
        bubbles: true,
        composed: true,
        detail: { wsId: this.wsId, cardId: this.card.id, mode: 'edit' },
      }),
    );
  }

  render() {
    const card = this.card;
    if (!card) return nothing;

    const priorityClass = card.priority ? `card priority-${card.priority}` : 'card';

    return html`
      <div class=${priorityClass} @click=${this._onClick}>
        ${card.priority
          ? html`<span class="priority-badge">${card.priority}</span>`
          : nothing}
        <span class="card-title">${card.title}</span>
        ${card.tags.length > 0
          ? html`
              <div class="card-tags">
                ${card.tags.map(
                  (tag) => html`<span class="tag-chip">${tag}</span>`,
                )}
              </div>
            `
          : nothing}
      </div>
    `;
  }
}

customElements.define('card-element', CardElement);
