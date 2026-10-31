import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { createEntry } from '@/api/entries';
import { tripQueries } from '@/api/trip-queries';
import { BackLink } from '@/components/back-link';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ChosenRule } from '@/components/log/chosen-rule';
import { ruleFromLogParams, type LogRouteParams } from '@/components/log/log-route';
import { PlayerPicker } from '@/components/log/player-picker';
import { RuleKindButtons } from '@/components/log/rule-kind-buttons';
import { RulePicker } from '@/components/log/rule-picker';
import { NumberStepper } from '@/components/number-stepper';
import { RulePointsFields } from '@/components/rules/rule-points-fields';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-fields';
import { ErrorText, Label, MutedText, Title } from '@/components/typography';
import { NOTE_MAX_LENGTH } from '@/constants/game-rules';
import { sharedStyles } from '@/constants/styles';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useLogEntryForm } from '@/hooks/use-log-entry-form';
import { useInvalidateTripQueries, useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { formatPoints, pluralize } from '@/utils/format';

export default function LogScreen() {
  const membership = useMembership();
  const params = useLocalSearchParams<LogRouteParams>();
  const players = useTripQuery(tripQueries.players);
  const rules = useTripQuery(tripQueries.rules);
  const form = useLogEntryForm(ruleFromLogParams(params));
  const submit = useAsyncAction();
  const invalidate = useInvalidateTripQueries();

  const subject = players.data?.find((player) => player.id === form.subjectId);
  const subjectLabel = subject?.id === membership.player_id ? 'yourself' : subject?.name;

  function logEntry() {
    submit.run(async () => {
      await createEntry(form.toNewEntry(membership.trip_id));
      invalidate([tripQueries.feed, tripQueries.playerEntries, tripQueries.leaderboard, tripQueries.rules]);
      router.back();
    });
  }

  return (
    <Screen>
      <BackLink label="Cancel" onPress={() => router.back()} />
      <Title
        subtitle={`Counts once ${pluralize(membership.vote_threshold, 'other player confirms', 'other players confirm')} it.`}>
        Log points
      </Title>
      <ErrorText>{players.error ?? rules.error}</ErrorText>

      <View style={sharedStyles.stack}>
        <Label>Who</Label>
        {players.data ? (
          <PlayerPicker
            players={players.data}
            myPlayerId={membership.player_id}
            selectedId={form.subjectId}
            onSelect={form.selectSubject}
          />
        ) : null}
      </View>

      <View style={sharedStyles.stack}>
        <Label>Why</Label>
        {form.selection.type === 'none' ? (
          <>
            <RuleKindButtons value={form.ruleKind} onChange={form.setRuleKind} />
            {form.ruleKind ? (
              <RulePicker
                rules={rules.data ?? []}
                kind={form.ruleKind}
                query={form.query}
                onChangeQuery={form.setQuery}
                onPickRule={form.pickRule}
                onCreateRule={form.startNewRule}
              />
            ) : null}
          </>
        ) : (
          <ChosenRule
            title={form.selection.type === 'existing' ? form.selection.rule.title : form.selection.title}
            isNew={form.selection.type === 'new'}
            onChange={form.clearRule}>
            {form.selection.type === 'new' ? (
              <>
                <RulePointsFields
                  kind={form.selection.kind}
                  magnitude={form.selection.magnitude}
                  onChangeKind={form.setNewRuleKind}
                  onChangeMagnitude={form.setNewRuleMagnitude}
                />
                <MutedText>Saved to the rulebook so anyone can use it next time.</MutedText>
              </>
            ) : null}
          </ChosenRule>
        )}
      </View>

      {form.points !== null && form.pointsRange ? (
        <Card>
          <Label>Points for this entry</Label>
          <NumberStepper
            value={form.points}
            min={form.pointsRange.min}
            max={form.pointsRange.max}
            onChange={form.setPoints}
            label="entry points"
            format={formatPoints}
          />
          <MutedText>Change it for repeat offences, like being 20 minutes late on a per-10-minutes rule.</MutedText>
        </Card>
      ) : null}

      <View style={sharedStyles.stack}>
        <Label>Note (optional)</Label>
        <TextField
          value={form.note}
          onChangeText={form.setNote}
          placeholder="What happened?"
          multiline
          maxLength={NOTE_MAX_LENGTH}
          accessibilityLabel="Note"
        />
      </View>

      <ErrorText>{submit.error}</ErrorText>
      <Button
        title={
          form.isComplete && form.points !== null && subjectLabel
            ? `Log ${formatPoints(form.points)} for ${subjectLabel}`
            : 'Log points'
        }
        onPress={logEntry}
        loading={submit.busy}
        disabled={!form.isComplete}
      />
    </Screen>
  );
}
