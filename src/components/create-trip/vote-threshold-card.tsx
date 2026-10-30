import { Card } from '@/components/card';
import { NumberStepper } from '@/components/number-stepper';
import { Label, MutedText } from '@/components/typography';

export const DEFAULT_VOTE_THRESHOLD = 3;

// The person who logs an entry and the person it's about can't vote on it.
export function maxVoteThreshold(playerCount: number) {
  return Math.max(1, playerCount - 2);
}

type VoteThresholdCardProps = {
  value: number;
  playerCount: number;
  onChange: (value: number) => void;
};

export function VoteThresholdCard({ value, playerCount, onChange }: VoteThresholdCardProps) {
  const max = maxVoteThreshold(playerCount);
  return (
    <Card>
      <Label>Votes needed to confirm points</Label>
      <NumberStepper value={value} min={1} max={max} onChange={onChange} label="votes needed" />
      <MutedText>
        The person who logs points and the person they&apos;re about can&apos;t vote, so with {playerCount} players the
        most is {max}.
      </MutedText>
    </Card>
  );
}
