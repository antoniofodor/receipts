import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import type { Rule } from '@/api/rules';
import { AccountButtons } from '@/components/account/account-buttons';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { RulePackActions } from '@/components/rule-packs/rule-pack-actions';
import { RulePackCard } from '@/components/rule-packs/rule-pack-card';
import { TapeLabel } from '@/components/tape-label';
import { TextField } from '@/components/text-fields';
import { ErrorText, Label, MutedText } from '@/components/typography';
import { PACK_NAME_MAX_LENGTH } from '@/constants/game-rules';
import { sharedStyles } from '@/constants/styles';
import { useAccount } from '@/hooks/use-account';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useCustomPackChanges, useCustomPacks } from '@/hooks/use-custom-packs';
import { customPackRef } from '@/utils/rule-packs';

const openPack = (id: string) => router.push({ pathname: '/custom-pack/[id]', params: { id } });

type MyRulePacksProps = {
  // The trip's rulebook, when this player can add packs to it.
  tripRules: Rule[] | null;
};

// The account's own packs, to reuse from trip to trip. Without an account there's nowhere to keep them.
export function MyRulePacks({ tripRules }: MyRulePacksProps) {
  const account = useAccount();
  const { packs, error } = useCustomPacks();
  if (!account) return null;

  return (
    <View style={sharedStyles.stack}>
      <TapeLabel>Your packs</TapeLabel>
      {account.hasAccount ? (
        <>
          <ErrorText>{error}</ErrorText>
          {packs?.map((pack) => (
            <RulePackCard
              key={pack.id}
              pack={pack}
              action={
                <View style={sharedStyles.stack}>
                  {tripRules ? <RulePackActions pack={customPackRef(pack)} tripRules={tripRules} /> : null}
                  <Button title="Edit pack" variant="secondary" onPress={() => openPack(pack.id)} />
                </View>
              }
            />
          ))}
          <NewPack />
        </>
      ) : (
        <Card seed="packs-need-account">
          <MutedText>Create an account or sign in to save your own rule packs.</MutedText>
          <AccountButtons />
        </Card>
      )}
    </View>
  );
}

// Only a button until it's wanted, so the screen isn't always carrying an empty form.
function NewPack() {
  const [naming, setNaming] = useState(false);
  if (!naming) return <Button title="New pack" icon="add" variant="secondary" onPress={() => setNaming(true)} />;
  return <NewPackCard onCancel={() => setNaming(false)} />;
}

function NewPackCard({ onCancel }: { onCancel: () => void }) {
  const [name, setName] = useState('');
  const changes = useCustomPackChanges();
  const { busy, error, run } = useAsyncAction();
  const trimmed = name.trim();

  function create() {
    run(async () => {
      const id = await changes.create(trimmed);
      setName('');
      openPack(id);
    });
  }

  return (
    <Card seed="new-pack">
      <Label>New pack</Label>
      <TextField
        value={name}
        onChangeText={setName}
        placeholder="e.g. Ski trip"
        autoFocus
        maxLength={PACK_NAME_MAX_LENGTH}
        returnKeyType="done"
        onSubmitEditing={() => trimmed && create()}
        accessibilityLabel="New pack name"
      />
      <ErrorText>{error}</ErrorText>
      <Button title="Create pack" onPress={create} loading={busy} disabled={trimmed.length === 0} />
      <Button title="Cancel" variant="secondary" onPress={onCancel} />
    </Card>
  );
}
