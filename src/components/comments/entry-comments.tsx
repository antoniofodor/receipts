import { useState } from 'react';
import { View } from 'react-native';

import type { Comment } from '@/api/comments';
import { tripQueries } from '@/api/trip-queries';
import { CommentComposer } from '@/components/comments/comment-composer';
import { CommentThreadList } from '@/components/comments/comment-thread-list';
import { ErrorText, MutedText, SectionLabel } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { useAddComment } from '@/hooks/use-add-comment';
import { useTripQuery } from '@/hooks/use-trip-query';
import { threadIdOf } from '@/utils/comment-threads';

// The box at the bottom always comments on the entry. Tapping a comment opens a reply box under its thread.
export function EntryComments({ entryId }: { entryId: string }) {
  const comments = useTripQuery(tripQueries.comments, entryId);
  const addComment = useAddComment(entryId);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  async function sendReply(body: string) {
    if (!replyingTo) return;
    await addComment(body, threadIdOf(replyingTo));
    setReplyingTo(null);
  }

  const count = comments.data?.length ?? 0;

  return (
    <View style={sharedStyles.stack}>
      <SectionLabel count={count > 0 ? count : undefined}>Comments</SectionLabel>
      <ErrorText>{comments.error}</ErrorText>
      {comments.data && count === 0 ? <MutedText>No comments yet. Start the argument.</MutedText> : null}
      {comments.data ? (
        <CommentThreadList
          comments={comments.data}
          onReply={setReplyingTo}
          openThreadId={replyingTo ? threadIdOf(replyingTo) : null}
          replyBox={
            replyingTo ? (
              <CommentComposer
                key={replyingTo.id}
                placeholder={`Reply to ${replyingTo.author.name}`}
                inputLabel="Your reply"
                onSend={sendReply}
                onCancel={() => setReplyingTo(null)}
                autoFocus
              />
            ) : null
          }
        />
      ) : null}
      <CommentComposer placeholder="Add a comment" inputLabel="Comment" onSend={(body) => addComment(body, null)} />
    </View>
  );
}
