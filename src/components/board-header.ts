import { LitElement, html, css } from 'lit';
import { STATUS_LIST, STATUS_LABELS } from '../models/types';

export class BoardHeader extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .board-header-row {
      display: grid;
      grid-template-columns: var(--ws-label-width) repeat(3, 1fr);
      gap: var(--spacing-sm);
      padding-bottom: var(--spacing-sm);
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--bg);
    }

    .status-col-header {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      padding: var(--spacing-sm) var(--spacing-md);
      text-align: center;
      background: var(--surface);
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }
  `;

  render() {
    return html`
      <div class="board-header-row">
        <div class="ws-label-spacer"></div>
        ${STATUS_LIST.map(
          (status) =>
            html`<div class="status-col-header">${STATUS_LABELS[status]}</div>`,
        )}
      </div>
    `;
  }
}

customElements.define('board-header', BoardHeader);
