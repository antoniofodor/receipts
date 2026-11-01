import { Text, type StyleProp, type TextStyle } from 'react-native';

import { useCountUp } from '@/hooks/use-count-up';
import { formatPoints } from '@/utils/format';

// Points that count to their new value when it changes, like a pump meter.
export function CountUpPoints({ points, style }: { points: number; style?: StyleProp<TextStyle> }) {
  const shown = useCountUp(points);
  return <Text style={style}>{formatPoints(shown)}</Text>;
}
