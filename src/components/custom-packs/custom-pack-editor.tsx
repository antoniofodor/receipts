import { useState } from 'react';
import { View } from 'react-native';

import type { CustomPack } from '@/api/custom-packs';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { AddPackRules } from '@/components/custom-packs/add-pack-rules';
import { PackRuleList } from '@/components/custom-packs/pack-rule-list';
import { TapeLabel } from '@/components/tape-label';
import { TextField } from '@/components/text-fields';
import { ErrorText, Label } from '@/components/typography';
import { PACK_NAME_MAX_LENGTH } from '@/constants/game-rules';
import { sharedStyles } from '@/constants/styles';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useCustomPackChanges } from '@/hooks/use-custom-packs';

export function CustomPackEditor({ pack, onDeleted }: { pack: CustomPack; onDeleted: () => void }) {
  const changes = useCustomPackChanges();
  return (
    <>
      <RenamePackCard pack={pack} />
      <View style={sharedStyles.stack}>
        <TapeLabel count={pack.rules.length}>Rules</TapeLabel>
        <PackRuleList pack={pack} />
      </View>
      <View style={sharedStyles.stack}>
        <TapeLabel>Add rules</TapeLabel>
        <AddPackRules pack={pack} />
      </View>
      <ConfirmDeleteButton
        label="Delete pack"
        confirmTitle={`Delete ${pack.name}?`}
        confirmMessage="Trips that already use this pack keep its rules."
        onConfirm={async () => {
          onDeleted();
          await changes.remove(pack.id);
        }}
      />
    </>
  );
}

function RenamePackCard({ pack }: { pack: CustomPack }) {
  const [name, setName] = useState(pack.name);
  const changes = useCustomPackChanges();
  const { busy, error, run } = useAsyncAction();
  const trimmed = name.trim().replace(/\s+/g, ' ');

  return (
    <Card seed={`pack-name-${pack.id}`}>
      <Label>Pack name</Label>
      <TextField value={name} onChangeText={setName} maxLength={PACK_NAME_MAX_LENGTH} accessibilityLabel="Pack name" />
      <ErrorText>{error}</ErrorText>
      <Button
        title="Rename"
        variant="secondary"
        onPress={() => run(() => changes.rename(pack.id, trimmed))}
        loading={busy}
        disabled={trimmed.length === 0 || trimmed === pack.name}
      />
    </Card>
  );
}
