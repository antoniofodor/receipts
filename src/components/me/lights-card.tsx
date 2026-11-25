import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { SegmentedControl } from '@/components/segmented-control';
import { Label } from '@/components/typography';
import { Fonts, Paper } from '@/constants/theme';
import { useLightMode } from '@/light-mode/light-mode-provider';
import { nextLightLabel } from '@/utils/light-mode';

// Day and night follow the clock, or stay where this phone puts them.
export function LightsCard() {
  const { mode, preference, setPreference } = useLightMode();
  return (
    <Card seed="lights">
      <View style={styles.header}>
        <Label>Lights</Label>
        {preference === 'auto' ? <Text style={styles.next}>{nextLightLabel(mode)}</Text> : null}
      </View>
      <SegmentedControl
        options={[
          { value: 'auto', label: 'Auto', icon: 'lightAuto' },
          { value: 'day', label: 'Day', icon: 'lightDay' },
          { value: 'night', label: 'Night', icon: 'lightNight' },
        ]}
        value={preference}
        onChange={setPreference}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  next: { fontFamily: Fonts.regular, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: Paper.muted },
});
