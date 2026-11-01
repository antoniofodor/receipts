import type { Entry, Vote } from '@/api/entries';
import { Colors } from '@/constants/theme';

export const players = {
  dev: { id: 'dev', name: 'Dev', color: Colors.ink, photo_path: null },
  jonno: { id: 'jonno', name: 'Jonno', color: Colors.ink, photo_path: null },
  sully: { id: 'sully', name: 'Sully', color: Colors.ink, photo_path: null },
  tommo: { id: 'tommo', name: 'Tommo', color: Colors.ink, photo_path: null },
};

export const vote = (voter: keyof typeof players, confirm: boolean): Vote => ({
  confirm,
  voter: { id: players[voter].id, name: players[voter].name },
});

export function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'entry-1',
    points: -5,
    note: null,
    status: 'pending',
    created_at: new Date().toISOString(),
    subject: players.jonno,
    filer: players.dev,
    rule: { title: 'Drinking from a straw' },
    votes: [],
    photos: [],
    commentCount: 0,
    ...overrides,
  };
}
