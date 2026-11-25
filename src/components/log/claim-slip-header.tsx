import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Paper } from '@/constants/theme';

export function ClaimSlipHeader({ tripName }: { tripName: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title} accessible={false} importantForAccessibility="no">
        ★ CLAIM SLIP ★
      </Text>
      <Text style={styles.trip}>{tripName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 2 },
  title: { fontFamily: Fonts.heavy, fontSize: 13, letterSpacing: 2, color: Paper.ink },
  trip: {
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Paper.muted,
  },
});
