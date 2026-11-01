import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Comment } from '@/api/comments';
import { AnimatedListItem } from '@/components/animated-list-item';
import { CommentRow } from '@/components/comments/comment-row';
import { Colors, Spacing } from '@/constants/theme';
import { toThreads } from '@/utils/comment-threads';

type CommentThreadListProps = {
  comments: Comment[];
  onReply: (comment: Comment) => void;
  openThreadId: string | null;
  replyBox: ReactNode;
};

export function CommentThreadList({ comments, onReply, openThreadId, replyBox }: CommentThreadListProps) {
  return (
    <View style={styles.list}>
      {toThreads(comments).map(({ comment, replies }) => {
        const isOpen = comment.id === openThreadId;
        return (
          <AnimatedListItem key={comment.id}>
            <View style={styles.thread}>
              <CommentRow comment={comment} onReply={onReply} />
              {replies.length > 0 || isOpen ? (
                <View style={styles.replies} accessibilityLabel={`Replies to ${comment.author.name}`}>
                  {replies.map((reply) => (
                    <AnimatedListItem key={reply.id}>
                      <CommentRow comment={reply} onReply={onReply} />
                    </AnimatedListItem>
                  ))}
                  {isOpen ? replyBox : null}
                </View>
              ) : null}
            </View>
          </AnimatedListItem>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.lg },
  thread: { gap: Spacing.md },
  replies: {
    gap: Spacing.md,
    marginLeft: Spacing.lg,
    paddingLeft: Spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: Colors.line,
  },
});
