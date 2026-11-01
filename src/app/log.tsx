import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { createEntry } from '@/api/entries';
import { entryListQueries, tripQueries } from '@/api/trip-queries';
import { BackLink } from '@/components/back-link';
import { Button } from '@/components/button';
import { ChosenRule } from '@/components/log/chosen-rule';
import { PhotoPickerField } from '@/components/log/photo-picker-field';
import { ruleFromLogParams, type LogRouteParams } from '@/components/log/log-route';
import { PlayerPicker } from '@/components/log/player-picker';
import { RuleKindButtons } from '@/components/log/rule-kind-buttons';
import { RulePicker } from '@/components/log/rule-picker';
import { RulePointsFields } from '@/components/rules/rule-points-fields';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-fields';
import { ErrorText, SectionLabel, Title } from '@/components/typography';
import { NOTE_MAX_LENGTH } from '@/constants/game-rules';
import { sharedStyles } from '@/constants/styles';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useLogEntryForm } from '@/hooks/use-log-entry-form';
import { useInvalidateTripQueries, useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { formatPoints } from '@/utils/format';

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
      invalidate([...entryListQueries, tripQueries.leaderboard, tripQueries.rules]);
      router.back();
    });
  }

  return (
    <Screen>
      <BackLink label="Cancel" onPress={() => router.back()} />
      <Title>Log points</Title>
      <ErrorText>{players.error ?? rules.error}</ErrorText>

      <View style={sharedStyles.stack}>
        <SectionLabel>Who</SectionLabel>
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
        <SectionLabel>What happened</SectionLabel>
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
            points={form.points ?? 0}
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
              </>
            ) : null}
          </ChosenRule>
        )}
      </View>

      <PhotoPickerField
        photos={form.photos}
        photosLeft={form.photosLeft}
        onAdd={form.addPhotos}
        onRemove={form.removePhoto}
      />

      <View style={sharedStyles.stack}>
        <SectionLabel>Note (optional)</SectionLabel>
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
