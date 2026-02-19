import { describe, it, expect } from 'vitest';
import { Priority, Status, STATUS_LIST, STATUS_LABELS } from './types';

describe('Priority', () => {
  it('has four levels', () => {
    expect(Object.keys(Priority)).toEqual(['Low', 'Medium', 'High', 'Urgent']);
  });

  it('maps to lowercase string values', () => {
    expect(Priority.Low).toBe('low');
    expect(Priority.Medium).toBe('medium');
    expect(Priority.High).toBe('high');
    expect(Priority.Urgent).toBe('urgent');
  });
});

describe('Status', () => {
  it('has three statuses', () => {
    expect(Object.keys(Status)).toEqual(['Backlog', 'InProgress', 'Done']);
  });

  it('maps to kebab-case string values', () => {
    expect(Status.Backlog).toBe('backlog');
    expect(Status.InProgress).toBe('in-progress');
    expect(Status.Done).toBe('done');
  });
});

describe('STATUS_LIST', () => {
  it('contains all statuses in display order', () => {
    expect(STATUS_LIST).toEqual(['backlog', 'in-progress', 'done']);
  });

  it('is a typed readonly array (compile-time constraint)', () => {
    // readonly in TypeScript is a compile-time constraint, not runtime frozen
    expect(Array.isArray(STATUS_LIST)).toBe(true);
    expect(STATUS_LIST).toHaveLength(3);
  });
});

describe('STATUS_LABELS', () => {
  it('provides human-readable labels for each status', () => {
    expect(STATUS_LABELS[Status.Backlog]).toBe('Backlog');
    expect(STATUS_LABELS[Status.InProgress]).toBe('In Progress');
    expect(STATUS_LABELS[Status.Done]).toBe('Done');
  });

  it('has an entry for every status in STATUS_LIST', () => {
    for (const status of STATUS_LIST) {
      expect(STATUS_LABELS[status]).toBeDefined();
      expect(typeof STATUS_LABELS[status]).toBe('string');
    }
  });
});
