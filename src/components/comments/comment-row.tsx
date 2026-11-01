import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Comment } from '@/api/comments';
import { Avatar } from '@/components/avatar';
import { MutedText } from '@/components/typography';
import { Colors, Spacing } from '@/constants/theme';
import { formatRelativeTime } from '@/utils/relative-time';

type CommentRowProps = {
  comment: Comment;
  onReply: (comment: Comment) => void;
};

// Tapping a comment opens a reply box under its thread.
export function CommentRow({ comment, onReply }: CommentRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Reply to ${comment.author.name}`}
      disabled={comment.sending}
      onPress={() => onReply(comment)}
      style={({ pressed }) => [styles.row, comment.sending && styles.sending, pressed && styles.pressed]}>
      <Avatar name={comment.author.name} color={comment.author.color} size={28} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.author}>{comment.author.name}</Text>
          <MutedText>{comment.sending ? 'Sending…' : formatRelativeTime(comment.created_at)}</MutedText>
        </View>
        <Text style={styles.body}>{comment.body}</Text>
        {comment.sending ? null : <Text style={styles.reply}>Reply</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm },
  sending: { opacity: 0.6 },
  pressed: { opacity: 0.7 },
  content: { flex: 1, gap: 2 },
  header: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm },
  author: { fontSize: 14, fontWeight: '700', color: Colors.ink },
  body: { fontSize: 15, lineHeight: 21, color: Colors.ink },
  reply: { fontSize: 13, fontWeight: '700', color: Colors.muted, paddingTop: 2 },
});
