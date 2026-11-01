import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { TRIP_CODE_LENGTH, TripCodeField } from '@/components/text-fields';
import { ErrorText, Label, MutedText, Title } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Spacing, Type } from '@/constants/theme';
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
  return (
    <>
      <View style={styles.hero}>
        <Text style={styles.brand}>RECEIPTS</Text>
        <Title>Join the trip</Title>
      </View>

      {lastTrip ? (
        <Card>
          <Label>Last trip on this phone</Label>
          <Text style={styles.lastTripName}>{lastTrip.name}</Text>
          <MutedText>Code {lastTrip.code}</MutedText>
          <Button title={`Rejoin ${lastTrip.name}`} onPress={() => onFindTrip(lastTrip.code)} loading={busy} />
        </Card>
      ) : null}

      <View style={sharedStyles.stack}>
        <Label>{lastTrip ? 'Or enter a trip code' : 'Trip code'}</Label>
        <TripCodeField value={code} onChangeText={onChangeCode} onSubmit={() => onFindTrip(code)} />
      </View>
      <ErrorText>{error}</ErrorText>
      <Button
        title="Find trip"
        onPress={() => onFindTrip(code)}
        loading={busy}
        disabled={code.length !== TRIP_CODE_LENGTH}
      />

      <View style={styles.divider} />
      <MutedText style={styles.centered}>Organising the trip?</MutedText>
      <Button title="Create a new trip" variant="secondary" onPress={onCreateTrip} />
    </>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.lg, marginTop: Spacing.xl },
  brand: { ...Type.display, fontSize: 64, lineHeight: 62 },
  lastTripName: Type.heading,
  divider: { height: 1, backgroundColor: Colors.line, marginVertical: Spacing.sm },
  centered: { textAlign: 'center' },
});
