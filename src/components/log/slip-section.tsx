import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { DashedRule } from '@/components/receipt/dashed-rule';
import { Label } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';

// One part of the claim slip, ruled off from the part above.
export function SlipSection({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <>
      <DashedRule />
      <View style={sharedStyles.stack}>
        <Label>{label}</Label>
        {children}
      </View>
    </>
  );
}
