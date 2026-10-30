import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

export function Avatar({ name, color, size = 36 }: { name: string; color: string; size?: number }) {
  return (
    <View style={[styles.circle, { width: size, height: size, backgroundColor: color }]}>
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{name.trim().charAt(0).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  initial: { color: Colors.onAccent, fontWeight: '800' },
});
