import { View } from 'react-native';

import { NumberStepper } from '@/components/number-stepper';
import { Label } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';

export const DEFAULT_VOTE_THRESHOLD = 3;

// The person who logs an entry and the person it's about can't vote on it.
export function maxVoteThreshold(playerCount: number) {
  return Math.max(1, playerCount - 2);
}

type VoteThresholdFieldProps = {
  value: number;
  playerCount: number;
  onChange: (value: number) => void;
};

export function VoteThresholdField({ value, playerCount, onChange }: VoteThresholdFieldProps) {
  const max = maxVoteThreshold(playerCount);
  return (
    <View style={sharedStyles.stack}>
      <Label>Approvals needed</Label>
      <NumberStepper value={value} min={1} max={max} onChange={onChange} label="votes needed" />
    </View>
  );
}
