export const Priority = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Urgent: 'urgent',
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

export interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority | null;
  tags: string[];
}

export interface Workstream {
  id: string;
  name: string;
  cards: Card[];
}

export interface Board {
  workstreams: Workstream[];
}
