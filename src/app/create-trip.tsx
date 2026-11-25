import { router } from 'expo-router';
import { useState } from 'react';

import { createTrip } from '@/api/trips';
import { BackLink } from '@/components/back-link';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ORGANISER_ROW_ID, PlayerListEditor, type PlayerRow } from '@/components/create-trip/player-list-editor';
import { RulePackPicker } from '@/components/create-trip/rule-pack-picker';
import {
  DEFAULT_VOTE_THRESHOLD,
  maxVoteThreshold,
  VoteThresholdField,
} from '@/components/create-trip/vote-threshold-field';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { Screen } from '@/components/screen';
import { PIN_LENGTH, PinField, TextField } from '@/components/text-fields';
import { SignTitle } from '@/components/ground/sign-title';
import { TapeLabel } from '@/components/tape-label';
import { ErrorText, Label, MutedText } from '@/components/typography';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useCustomPacks } from '@/hooks/use-custom-packs';
import { useRulePacks } from '@/hooks/use-rule-packs';
import { useSession } from '@/session/session-provider';
import { defaultRulePackIds, toggled } from '@/utils/rule-packs';

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
  const rulePacks = useRulePacks();
  // Null until the organiser touches a pack, so the default follows the catalog once it loads.
  const [pickedPackIds, setPickedPackIds] = useState<string[] | null>(null);
  const customPacks = useCustomPacks();
  const [customPackIds, setCustomPackIds] = useState<string[]>([]);
  // Before the catalog loads there's nothing to pick from, so the server's default applies.
  const rulePackIds = pickedPackIds ?? (rulePacks.packs ? defaultRulePackIds(rulePacks.packs) : undefined);

  const namedRows = rows.map((row) => ({ ...row, name: row.name.trim() })).filter((row) => row.name.length > 0);
  const organiserName = namedRows.find((row) => row.id === ORGANISER_ROW_ID)?.name ?? '';
  const voteThreshold = Math.min(requestedVoteThreshold, maxVoteThreshold(namedRows.length));
  const canCreate =
    tripName.trim().length > 0 &&
    organiserName.length > 0 &&
    namedRows.length >= MIN_PLAYERS &&
    pin.length === PIN_LENGTH;

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
        rulePackIds,
        customPackIds,
      });
      await reloadMembership();
    });
  }

  return (
    <Screen>
      <BackLink onPress={() => router.back()} />
      <SignTitle>New trip</SignTitle>

      <Card seed="new-trip-name">
        <Label>Trip name</Label>
        <TextField
          value={tripName}
          onChangeText={setTripName}
          placeholder="Lisbon 2026"
          maxLength={60}
          accessibilityLabel="Trip name"
        />
      </Card>

      <TapeLabel>Who&apos;s in</TapeLabel>
      <PlayerListEditor
        rows={rows}
        groomRowId={groomRowId}
        onRename={renameRow}
        onRemove={removeRow}
        onAdd={addRow}
        onToggleGroom={(rowId) => setGroomRowId((current) => (current === rowId ? null : rowId))}
      />

      <TapeLabel>House rules</TapeLabel>
      <Card seed="new-trip-house-rules">
        <VoteThresholdField value={voteThreshold} playerCount={namedRows.length} onChange={setRequestedVoteThreshold} />
        <DashedRule />
        <RulePackPicker
          packs={rulePacks.packs}
          error={rulePacks.error}
          pickedIds={rulePackIds ?? []}
          onToggle={(packId) => setPickedPackIds(toggled(rulePackIds ?? [], packId))}
          customPacks={customPacks.packs}
          pickedCustomIds={customPackIds}
          onToggleCustom={(packId) => setCustomPackIds((current) => toggled(current, packId))}
        />
        <DashedRule />
        <Label>Your 4-digit PIN</Label>
        <PinField value={pin} onChangeText={setPin} accessibilityLabel="Your PIN" />
        <MutedText>You&apos;ll need it on a new phone.</MutedText>
      </Card>

      <ErrorText>{error}</ErrorText>
      <Button title="Create trip" onPress={create} loading={busy} disabled={!canCreate} />
      {canCreate ? null : (
        <MutedText
          style={{
            textAlign: 'center',
          }}>{`Needs a trip name, your name, at least ${MIN_PLAYERS} players and a PIN.`}</MutedText>
      )}
    </Screen>
  );
}
