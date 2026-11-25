import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { NeonSign } from '@/components/ground/neon-sign';
import { SignTitle } from '@/components/ground/sign-title';
import { JoinAccountOptions } from '@/components/join/join-account-options';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { LineItem } from '@/components/receipt/line-item';
import { TapeLabel } from '@/components/tape-label';
import { TRIP_CODE_LENGTH, TripCodeField } from '@/components/text-fields';
import { ErrorText, Label, MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Fonts, Paper, Spacing, Type, type GroundPalette } from '@/constants/theme';
import { useGround } from '@/light-mode/light-mode-provider';
import { useThemedStyles } from '@/light-mode/use-themed-styles';
import type { LastTrip } from '@/session/session-storage';

type TripCodeStepProps = {
  code: string;
  onChangeCode: (code: string) => void;
  onFindTrip: (code: string) => void;
  onCreateTrip: () => void;
  lastTrip: LastTrip | null;
  busy: boolean;
  error: string | null;
};

export function TripCodeStep({
  code,
  onChangeCode,
  onFindTrip,
  onCreateTrip,
  lastTrip,
  busy,
  error,
}: TripCodeStepProps) {
  const styles = useThemedStyles(makeStyles);
  const ground = useGround();
  return (
    <>
      <View style={styles.hero}>
        <Text style={styles.signage} accessible={false} importantForAccessibility="no">
          Gas &amp; Go · Open 24 hrs
        </Text>
        <SignTitle tileHeight={42}>Receipts</SignTitle>
        <View style={styles.headlineRow}>
          <Text style={styles.headline} accessibilityRole="header">
            Join the trip
          </Text>
          <NeonSign>Open</NeonSign>
        </View>
      </View>

      {lastTrip ? (
        <Card seed={lastTrip.code}>
          <Label>Last trip on this phone</Label>
          <Text style={Type.heading}>{lastTrip.name}</Text>
          <LineItem label="Code" value={<Text style={codeStyles.code}>{lastTrip.code}</Text>} />
          <Button title={`Rejoin ${lastTrip.name}`} onPress={() => onFindTrip(lastTrip.code)} loading={busy} />
        </Card>
      ) : null}

      <View style={sharedStyles.stack}>
        <TapeLabel>{lastTrip ? 'Or enter a trip code' : 'Trip code'}</TapeLabel>
        <TripCodeField value={code} onChangeText={onChangeCode} onSubmit={() => onFindTrip(code)} />
      </View>
      <ErrorText>{error}</ErrorText>
      <Button
        title="Find trip"
        onPress={() => onFindTrip(code)}
        loading={busy}
        disabled={code.length !== TRIP_CODE_LENGTH}
      />

      <DashedRule color={ground.line} />
      <MutedText style={styles.centered}>Organising the trip?</MutedText>
      <Button title="Create a new trip" variant="secondary" onPress={onCreateTrip} />
      <DashedRule color={ground.line} />
      <JoinAccountOptions />
    </>
  );
}

const codeStyles = StyleSheet.create({
  code: { fontFamily: Fonts.heavy, fontSize: 16, letterSpacing: 3, color: Paper.ink },
});

const makeStyles = (ground: GroundPalette) =>
  StyleSheet.create({
    hero: { gap: Spacing.md, marginTop: Spacing.lg },
    signage: {
      fontFamily: Fonts.semiBold,
      fontSize: 10.5,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: ground.textMuted,
    },
    headlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
    headline: { ...Type.heading, color: ground.text, flexShrink: 1 },
    centered: { textAlign: 'center' },
  });
