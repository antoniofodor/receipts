import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { createTrip } from '@/api/trips';
import { BackLink } from '@/components/back-link';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ORGANISER_ROW_ID, PlayerListEditor, type PlayerRow } from '@/components/create-trip/player-list-editor';
import {
  DEFAULT_VOTE_THRESHOLD,
  maxVoteThreshold,
  VoteThresholdCard,
} from '@/components/create-trip/vote-threshold-card';
import { Screen } from '@/components/screen';
import { PIN_LENGTH, PinField, TextField } from '@/components/text-fields';
import { ErrorText, Label, MutedText, Title } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useSession } from '@/session/session-provider';

const MIN_PLAYERS = 3;
const INITIAL_ROWS: PlayerRow[] = [
  { id: ORGANISER_ROW_ID, name: '' },
  { id: 'player-1', name: '' },
  { id: 'player-2', name: '' },
  { id: 'player-3', name: '' },
];

export default function CreateTripScreen() {
  const { reloadMembership } = useSession();
  const { busy, error, run } = useAsyncAction();
  const [tripName, setTripName] = useState('');
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [nextRowNumber, setNextRowNumber] = useState(INITIAL_ROWS.length);
  const [groomRowId, setGroomRowId] = useState<string | null>(null);
  const [requestedVoteThreshold, setRequestedVoteThreshold] = useState(DEFAULT_VOTE_THRESHOLD);
  const [pin, setPin] = useState('');

  const namedRows = rows
    .map((row) => ({ ...row, name: row.name.trim() }))
    .filter((row) => row.name.length > 0);
  const organiserName = namedRows.find((row) => row.id === ORGANISER_ROW_ID)?.name ?? '';
  const voteThreshold = Math.min(requestedVoteThreshold, maxVoteThreshold(namedRows.length));
  const canCreate =
    tripName.trim().length > 0 && organiserName.length > 0 && namedRows.length >= MIN_PLAYERS && pin.length === PIN_LENGTH;

  function addRow() {
    setRows((current) => [...current, { id: `player-${nextRowNumber}`, name: '' }]);
    setNextRowNumber((n) => n + 1);
  }

  function removeRow(rowId: string) {
    setRows((current) => current.filter((row) => row.id !== rowId));
    setGroomRowId((current) => (current === rowId ? null : current));
  }

  function renameRow(rowId: string, name: string) {
    setRows((current) => current.map((row) => (row.id === rowId ? { ...row, name } : row)));
  }

  function create() {
    run(async () => {
      await createTrip({
        name: tripName.trim(),
        organiserName,
        otherPlayerNames: namedRows.filter((row) => row.id !== ORGANISER_ROW_ID).map((row) => row.name),
        groomName: namedRows.find((row) => row.id === groomRowId)?.name ?? null,
        voteThreshold,
        pin,
      });
      await reloadMembership();
    });
  }

  return (
    <Screen>
      <BackLink onPress={() => router.back()} />
      <Title subtitle="You'll get a code to send to the group. Everyone joins by tapping their name.">Create a trip</Title>

      <View style={sharedStyles.stack}>
        <Label>Trip name</Label>
        <TextField value={tripName} onChangeText={setTripName} placeholder="Lisbon 2026" maxLength={60} accessibilityLabel="Trip name" />
      </View>

      <PlayerListEditor
        rows={rows}
        groomRowId={groomRowId}
        onRename={renameRow}
        onRemove={removeRow}
        onAdd={addRow}
        onToggleGroom={(rowId) => setGroomRowId((current) => (current === rowId ? null : rowId))}
      />

      <VoteThresholdCard value={voteThreshold} playerCount={namedRows.length} onChange={setRequestedVoteThreshold} />

      <Card>
        <Label>Your 4-digit PIN</Label>
        <PinField value={pin} onChangeText={setPin} accessibilityLabel="Your PIN" />
        <MutedText>You&apos;ll need it if you switch phones.</MutedText>
      </Card>

      <ErrorText>{error}</ErrorText>
      <Button title="Create trip" onPress={create} loading={busy} disabled={!canCreate} />
      {canCreate ? null : (
        <MutedText style={{ textAlign: 'center' }}>{`Needs a trip name, your name, at least ${MIN_PLAYERS} players and a PIN.`}</MutedText>
      )}
    </Screen>
  );
}
