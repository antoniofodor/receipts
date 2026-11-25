import { StyleSheet, Text, View } from 'react-native';

import type { LeaderboardRow } from '@/api/leaderboard';
import { Avatar } from '@/components/avatar';
import { SignTitle } from '@/components/ground/sign-title';
import { PumpDisplay } from '@/components/receipt/pump-display';
import { Fonts, Spacing, Wear, type GroundPalette } from '@/constants/theme';
import { useCountUp } from '@/hooks/use-count-up';
import { useThemedStyles } from '@/light-mode/use-themed-styles';

const PHOTO_SIZE = 64;

export function PlayerSummary({ row, isMe }: { row: LeaderboardRow; isMe: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const total = useCountUp(row.points);
  const details = [
    row.is_groom && '★ Groom',
    isMe && 'You',
    `#${row.rank}`,
    row.pending_count > 0 && `${row.pending_count} pending`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.stack}>
      <View style={styles.header}>
        <View style={styles.instantPhoto}>
          <Avatar name={row.name} color={row.color} photoPath={row.photo_path} size={PHOTO_SIZE} square />
          <View
            pointerEvents="none"
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={styles.tape}
          />
        </View>
        <View style={styles.nameColumn}>
          <SignTitle tileHeight={32}>{row.name}</SignTitle>
          <Text style={styles.details}>{details}</Text>
        </View>
      </View>
      <PumpDisplay cells={[{ label: 'Total', unit: 'pts', value: total }]} />
    </View>
  );
}

const makeStyles = (ground: GroundPalette) =>
  StyleSheet.create({
    stack: { gap: Spacing.lg },
    header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
    instantPhoto: {
      padding: 6,
      paddingBottom: 18,
      backgroundColor: Wear.print,
      boxShadow: Wear.printShadow,
      transform: [{ rotate: '-3deg' }],
    },
    tape: {
      position: 'absolute',
      top: -7,
      alignSelf: 'center',
      width: 44,
      height: 15,
      backgroundColor: Wear.tape,
      boxShadow: Wear.tapeShadow,
      transform: [{ rotate: '4deg' }],
    },
    nameColumn: { flex: 1, gap: Spacing.sm },
    details: {
      fontFamily: Fonts.semiBold,
      fontSize: 11,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: ground.textMuted,
    },
  });
