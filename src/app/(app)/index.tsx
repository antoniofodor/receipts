import { Card } from '@/components/card';
import { InviteCard } from '@/components/invite-card';
import { Screen } from '@/components/screen';
import { Label, MutedText, Title } from '@/components/typography';
import { useMembership } from '@/session/session-provider';

export default function FeedScreen() {
  const membership = useMembership();

  return (
    <Screen>
      <Title subtitle={`You're in as ${membership.player_name}`}>{membership.trip_name}</Title>
      <InviteCard membership={membership} />
      <Card>
        <Label>Coming next</Label>
        <MutedText>
          Logging points, voting and photos land here in the next milestones. Check the Board and Rules tabs to see the
          trip so far.
        </MutedText>
      </Card>
    </Screen>
  );
}
