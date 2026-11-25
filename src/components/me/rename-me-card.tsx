import { useState } from 'react';
import { View } from 'react-native';

import { tripQueries } from '@/api/trip-queries';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { TextField } from '@/components/text-fields';
import { ErrorText, Label, MutedText } from '@/components/typography';
import { PLAYER_NAME_MAX_LENGTH } from '@/constants/game-rules';
import { sharedStyles } from '@/constants/styles';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useRenameMe } from '@/hooks/use-rename-me';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { normalisePlayerName, playerNameProblem } from '@/utils/player-name';

export function RenameMeCard({ onDone }: { onDone: () => void }) {
  const { player_id: myPlayerId, player_name: currentName } = useMembership();
  const players = useTripQuery(tripQueries.players);
  const renameMe = useRenameMe();
  const { busy, error, run } = useAsyncAction();
  const [name, setName] = useState(currentName);
  const cleaned = normalisePlayerName(name);
  const problem = playerNameProblem(name, players.data ?? [], myPlayerId);
  const canSave = problem === null && cleaned !== currentName;

  function save() {
    if (!canSave || busy) return;
    run(async () => {
      await renameMe(name);
      onDone();
    });
  }

  return (
    <Card seed={`my-name-${myPlayerId}`}>
      <Label>Your name</Label>
      <TextField
        value={name}
        onChangeText={setName}
        maxLength={PLAYER_NAME_MAX_LENGTH}
        autoFocus
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={save}
        accessibilityLabel="Your name"
      />
      {cleaned && problem ? <MutedText>{problem}</MutedText> : null}
      <ErrorText>{error}</ErrorText>
      <View style={sharedStyles.stack}>
        <Button title="Save name" onPress={save} loading={busy} disabled={!canSave} />
        <Button title="Cancel" variant="secondary" onPress={onDone} disabled={busy} />
      </View>
    </Card>
  );
}
