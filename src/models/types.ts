export const Priority = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Urgent: 'urgent',
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

export const Status = {
  Backlog: 'backlog',
  InProgress: 'in-progress',
  Done: 'done',
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const STATUS_LIST: readonly Status[] = [Status.Backlog, Status.InProgress, Status.Done];

export const STATUS_LABELS: Record<Status, string> = {
  [Status.Backlog]: 'Backlog',
  [Status.InProgress]: 'In Progress',
  [Status.Done]: 'Done',
};

export interface Card {
  id: string;
  title: string;
  description: string;
  status: Status;
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
