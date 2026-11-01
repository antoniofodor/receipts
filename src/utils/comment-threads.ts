import type { Comment } from '@/api/comments';

export type CommentThread = { comment: Comment; replies: Comment[] };

// Comments arrive oldest first. A reply whose parent is outside the loaded page stands on its own.
export function toThreads(comments: Comment[]): CommentThread[] {
  const threads = new Map<string, CommentThread>();
  for (const comment of comments) {
    const parent = comment.parent_id ? threads.get(comment.parent_id) : undefined;
    if (parent) parent.replies.push(comment);
    else threads.set(comment.id, { comment, replies: [] });
  }
  return [...threads.values()];
}

// The database allows one level of replies, so replying to a reply joins its thread.
export function threadIdOf(comment: Comment) {
  return comment.parent_id ?? comment.id;
}
