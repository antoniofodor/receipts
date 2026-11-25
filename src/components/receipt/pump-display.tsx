import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { makePumpStyles } from '@/components/receipt/pump-styles';
import { Fonts, Spacing, type GroundPalette } from '@/constants/theme';
import { useThemedStyles } from '@/light-mode/use-themed-styles';
import { pumpDigits } from '@/utils/pump-digits';

const ROLL_DISTANCE = 18;
const ROLL_UP = FadeInUp.duration(260).withInitialValues({ transform: [{ translateY: ROLL_DISTANCE }] });
const ROLL_DOWN = FadeInDown.duration(260).withInitialValues({ transform: [{ translateY: -ROLL_DISTANCE }] });

export type PumpCell = {
  label: string;
  value: number;
  unit?: string;
  // Which way the digits roll when the value changes: up for more, down for less.
  direction?: number;
};

type PumpDisplayProps = {
  cells: PumpCell[];
};

// The fuel pump: one lit window per number, in a housing that's red by day and gunmetal at night.
export function PumpDisplay({ cells }: PumpDisplayProps) {
  const styles = useThemedStyles(makeStyles);
  const pump = useThemedStyles(makePumpStyles);
  const large = cells.length === 1;
  return (
    <View style={[pump.housing, styles.cells]}>
      {cells.map((cell) => (
        <PumpWindow key={cell.label} cell={cell} large={large} />
      ))}
    </View>
  );
}

function PumpWindow({ cell, large }: { cell: PumpCell; large: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const pump = useThemedStyles(makePumpStyles);
  const { sign, unlit, lit, spoken } = pumpDigits(cell.value);
  const direction = cell.direction ?? 0;
  const entering = direction > 0 ? ROLL_UP : direction < 0 ? ROLL_DOWN : undefined;
  const digitStyle = [pump.led, styles.digits, large && styles.large, cell.value < 0 && styles.negative];
  return (
    <View style={[pump.window, styles.window]} accessible accessibilityLabel={`${cell.label}: ${spoken}`}>
      <View style={styles.labels}>
        <Text style={styles.label} numberOfLines={1}>
          {cell.label}
        </Text>
        {cell.unit ? <Text style={styles.label}>{cell.unit}</Text> : null}
      </View>
      <View style={styles.readout}>
        <Text style={digitStyle}>
          {sign}
          <Text style={pump.unlit}>{unlit}</Text>
        </Text>
        <Animated.Text key={cell.value} entering={entering} style={digitStyle}>
          {lit}
        </Animated.Text>
      </View>
    </View>
  );
}

const makeStyles = (ground: GroundPalette) =>
  StyleSheet.create({
    cells: { flexDirection: 'row', gap: Spacing.sm },
    window: { flex: 1, gap: Spacing.xs },
    labels: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
    label: {
      flexShrink: 1,
      fontFamily: Fonts.regular,
      fontSize: 9.5,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: ground.pumpLabel,
    },
    readout: { flexDirection: 'row', overflow: 'hidden' },
    digits: { fontSize: 30, lineHeight: 36, letterSpacing: 2 },
    large: { fontSize: 40, lineHeight: 46 },
    negative: { color: ground.ledNegative, textShadowColor: ground.ledNegativeGlow },
  });
