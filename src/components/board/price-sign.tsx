import { StyleSheet, Text, View } from 'react-native';

import type { LeaderboardRow } from '@/api/leaderboard';
import { SignLetters } from '@/components/ground/sign-letters';
import { Fonts, Radius, Spacing, type GroundPalette } from '@/constants/theme';
import { useThemedStyles } from '@/light-mode/use-themed-styles';
import { MINUS_SIGN } from '@/utils/format';

const NAME_LETTERS = 10;
const HEADING_TILE = 18;
const ROW_TILE = 24;

// The top three on a gas station price sign. Hidden from screen readers:
// the standings receipt below says the same thing properly.
export function PriceSign({ rows }: { rows: LeaderboardRow[] }) {
  const styles = useThemedStyles(makeStyles);
  const leaders = rows.slice(0, 3);
  if (leaders.length === 0) return null;
  return (
    <View
      testID="price-sign"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.frame}>
      <View style={styles.heading}>
        <SignLetters text="TODAY'S LEADERS" height={HEADING_TILE} />
        <Text style={styles.unit}>PTS</Text>
      </View>
      <View style={styles.body}>
        {leaders.map((row, index) => (
          <View key={row.player_id} style={[styles.row, index < leaders.length - 1 && styles.divided]}>
            <SignLetters text={row.name.slice(0, NAME_LETTERS)} height={ROW_TILE} />
            <SignLetters text={row.points < 0 ? `${MINUS_SIGN}${-row.points}` : String(row.points)} height={ROW_TILE} />
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (ground: GroundPalette) =>
  StyleSheet.create({
    frame: {
      padding: Spacing.sm,
      borderRadius: Radius.display,
      backgroundColor: ground.signFrame,
      boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.28)',
    },
    heading: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.xs,
      paddingTop: 2,
      paddingBottom: Spacing.sm,
    },
    unit: { fontFamily: Fonts.regular, fontSize: 10, letterSpacing: 1.5, color: ground.signBody },
    body: {
      paddingHorizontal: 10,
      paddingVertical: Spacing.xs,
      borderRadius: 3,
      backgroundColor: ground.signBody,
      backgroundImage:
        'linear-gradient(rgba(255, 255, 255, 0.5), transparent 40%), ' +
        'radial-gradient(60px 30px at 85% 85%, rgba(150, 120, 60, 0.18), transparent 70%)',
      ...(ground.signGlow ? { boxShadow: ground.signGlow } : null),
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
    divided: { borderBottomWidth: 3, borderBottomColor: 'rgba(0, 0, 0, 0.12)' },
  });
