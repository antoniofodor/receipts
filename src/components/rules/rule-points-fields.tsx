import { View } from 'react-native';

import { NumberStepper } from '@/components/number-stepper';
import { SegmentedControl } from '@/components/segmented-control';
import { sharedStyles } from '@/constants/styles';
import { formatPoints } from '@/utils/format';
import { rulePointsRange, signedPoints, type RuleKind } from '@/utils/points';

// Steps along the number line like the entry points stepper: + on a penalty goes from −5 to −4.
function signedRange(kind: RuleKind) {
  return kind === 'penalty'
    ? { min: -rulePointsRange.max, max: -rulePointsRange.min }
    : { min: rulePointsRange.min, max: rulePointsRange.max };
}

type RulePointsFieldsProps = {
  kind: RuleKind;
  magnitude: number;
  onChangeKind: (kind: RuleKind) => void;
  onChangeMagnitude: (magnitude: number) => void;
};

export function RulePointsFields({ kind, magnitude, onChangeKind, onChangeMagnitude }: RulePointsFieldsProps) {
  const range = signedRange(kind);
  return (
    <View style={sharedStyles.stack}>
      <SegmentedControl
        options={[
          { value: 'penalty', label: 'Penalty' },
          { value: 'bonus', label: 'Bonus' },
        ]}
        value={kind}
        onChange={onChangeKind}
      />
      <NumberStepper
        value={signedPoints(kind, magnitude)}
        min={range.min}
        max={range.max}
        onChange={(points) => onChangeMagnitude(Math.abs(points))}
        label="rule points"
        format={formatPoints}
      />
    </View>
  );
}
