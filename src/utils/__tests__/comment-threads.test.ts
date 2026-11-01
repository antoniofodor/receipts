import type { Comment } from '@/api/comments';
import { players } from '@/test-utils/entry-fixture';
import { threadIdOf, toThreads } from '@/utils/comment-threads';

const comment = (id: string, parentId: string | null = null): Comment => ({
  id,
  entry_id: 'entry-1',
  parent_id: parentId,
  body: id,
  created_at: '2026-10-31T12:00:00Z',
  author: players.dev,
});

describe('toThreads', () => {
  it('nests replies under their parent, keeping the order they were written', () => {
    const threads = toThreads([comment('a'), comment('b'), comment('a1', 'a'), comment('b1', 'b'), comment('a2', 'a')]);

    expect(threads.map((thread) => [thread.comment.id, thread.replies.map((reply) => reply.id)])).toEqual([
      ['a', ['a1', 'a2']],
      ['b', ['b1']],
    ]);
  });

  it('shows a reply on its own when its parent is outside the loaded comments', () => {
    expect(toThreads([comment('orphan', 'gone')]).map((thread) => thread.comment.id)).toEqual(['orphan']);
  });
});

describe('threadIdOf', () => {
  it('sends a reply to a reply into the same thread', () => {
    expect(threadIdOf(comment('a1', 'a'))).toBe('a');
    expect(threadIdOf(comment('a'))).toBe('a');
  });
});
