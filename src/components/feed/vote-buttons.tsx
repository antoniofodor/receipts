import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Key } from '@/components/key';
import { ErrorText } from '@/components/typography';
import { Spacing, Type, Wear } from '@/constants/theme';
import { useVote } from '@/hooks/use-vote';
import { useGround } from '@/light-mode/light-mode-provider';

// Approve and Decline as two pump keys. They glow brighter at night, so they read the light.
export function VoteButtons({ entryId }: { entryId: string }) {
  const { vote, busy, error } = useVote(entryId);
  const ground = useGround();

  return (
    <View style={styles.stack}>
      <View style={styles.keys}>
        <Key
          accessibilityRole="button"
          accessibilityLabel="Decline"
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          feedback="warning"
          onPress={() => vote(false)}
          face={ground.decline}
          edge={ground.declineEdge}
          style={[styles.decline, busy && styles.busy]}>
          <Icon name="decline" size={18} color={ground.onDecline} />
          <Text style={[Type.key, { color: ground.onDecline }]}>Decline</Text>
          <View
            testID="duct-tape"
            pointerEvents="none"
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={styles.ductTape}
          />
        </Key>
        <Key
          accessibilityRole="button"
          accessibilityLabel="Approve"
          accessibilityState={{ disabled: busy, busy }}
          disabled={busy}
          feedback="success"
          onPress={() => vote(true)}
          face={ground.approve}
          edge={ground.approveEdge}
          style={styles.approve}>
          {busy ? (
            <ActivityIndicator color={ground.onApprove} />
          ) : (
            <>
              <Icon name="approve" size={18} color={ground.onApprove} />
              <Text style={[Type.key, { color: ground.onApprove }]}>Approve</Text>
            </>
          )}
        </Key>
      </View>
      <ErrorText>{error}</ErrorText>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.xs },
  keys: { flexDirection: 'row', gap: Spacing.sm },
  decline: { flex: 1 },
  approve: { flex: 1.4 },
  busy: { opacity: 0.6 },
  ductTape: {
    position: 'absolute',
    top: -4,
    right: -12,
    width: 54,
    height: 16,
    backgroundImage: `linear-gradient(90deg, ${Wear.ductTape[0]} 50%, ${Wear.ductTape[1]} 50%)`,
    backgroundSize: '6px 100%',
    transform: [{ rotate: '28deg' }],
  },
});
