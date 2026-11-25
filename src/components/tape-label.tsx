import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Fonts, Paper, Spacing, Type, Wear } from '@/constants/theme';

const TAPE_HEIGHT = 30;
const END_WIDTH = 5;

// Torn masking tape doesn't end square: each end is a small ragged zig-zag.
const RAGGED_END = {
  left: `M${END_WIDTH} 0 L1 2 L3 8 L0 14 L2 21 L0 27 L2 ${TAPE_HEIGHT} L${END_WIDTH} ${TAPE_HEIGHT} Z`,
  right: `M0 0 L4 1 L2 7 L5 13 L3 19 L5 26 L3 ${TAPE_HEIGHT} L0 ${TAPE_HEIGHT} Z`,
};

function TapeEnd({ side }: { side: 'left' | 'right' }) {
  return (
    <Svg width={END_WIDTH} height={TAPE_HEIGHT} accessible={false}>
      <Path d={RAGGED_END[side]} fill={Paper.tape} />
    </Svg>
  );
}

type TapeLabelProps = {
  children: string;
  count?: number;
};

// A section heading written in marker on a strip of masking tape, with any count circled in red pen.
export function TapeLabel({ children, count }: TapeLabelProps) {
  const spoken = count === undefined ? children : `${children}, ${count}`;
  return (
    <View style={styles.row}>
      <View accessible accessibilityRole="header" accessibilityLabel={spoken} style={styles.tape}>
        <TapeEnd side="left" />
        <View style={styles.body}>
          <Text style={Type.tape}>{children}</Text>
          {count !== undefined ? (
            <View style={styles.penCircle}>
              <Text style={styles.count}>{count}</Text>
            </View>
          ) : null}
        </View>
        <TapeEnd side="right" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginTop: Spacing.xs },
  tape: { flexDirection: 'row', transform: [{ rotate: '-2.5deg' }] },
  body: {
    height: TAPE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: Paper.tape,
    boxShadow: Wear.labelShadow,
  },
  penCircle: {
    minWidth: 30,
    height: 26,
    marginLeft: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: Paper.red,
    borderRadius: 13,
    transform: [{ rotate: '-6deg' }],
  },
  count: { fontFamily: Fonts.marker, fontSize: 15, color: Paper.red },
});
