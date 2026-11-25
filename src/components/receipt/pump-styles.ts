import { StyleSheet } from 'react-native';

import { Fonts, Radius, Spacing, type GroundPalette } from '@/constants/theme';

// The pump's housing, its lit window and the glowing LED characters, shared by everything drawn as part of a pump.
export const makePumpStyles = (ground: GroundPalette) =>
  StyleSheet.create({
    housing: {
      padding: Spacing.sm,
      borderRadius: Radius.pump,
      borderWidth: 1,
      borderColor: ground.pumpEdge,
      boxShadow: '0px 8px 18px rgba(0, 0, 0, 0.28)',
      backgroundImage: [
        'radial-gradient(30px 8px at 20% 90%, rgba(0, 0, 0, 0.18), transparent 70%)',
        'radial-gradient(40px 6px at 80% 6%, rgba(255, 255, 255, 0.12), transparent 70%)',
        `linear-gradient(${ground.pumpBody[0]}, ${ground.pumpBody[1]})`,
      ].join(', '),
    },
    window: {
      paddingHorizontal: 10,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.display,
      backgroundColor: ground.display,
      boxShadow: 'inset 0px 2px 8px rgba(0, 0, 0, 0.9)',
      backgroundImage: 'linear-gradient(115deg, rgba(255, 255, 255, 0.06) 30%, transparent 30%)',
    },
    led: {
      fontFamily: Fonts.heavy,
      color: ground.led,
      textShadowColor: ground.ledGlow,
      textShadowRadius: 10,
      textShadowOffset: { width: 0, height: 0 },
      fontVariant: ['tabular-nums'],
    },
    unlit: { opacity: 0.18 },
  });
