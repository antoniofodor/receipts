import { BarlowCondensed_800ExtraBold } from '@expo-google-fonts/barlow-condensed/800ExtraBold';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono/600SemiBold';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';
import { JetBrainsMono_800ExtraBold } from '@expo-google-fonts/jetbrains-mono/800ExtraBold';
import { useFonts } from 'expo-font';

import { Fonts } from '@/constants/theme';

const FONT_FILES = {
  [Fonts.regular]: JetBrainsMono_400Regular,
  [Fonts.medium]: JetBrainsMono_500Medium,
  [Fonts.semiBold]: JetBrainsMono_600SemiBold,
  [Fonts.bold]: JetBrainsMono_700Bold,
  [Fonts.heavy]: JetBrainsMono_800ExtraBold,
  [Fonts.display]: BarlowCondensed_800ExtraBold,
};

// A font that fails to load falls back to the system font rather than keeping the app on the splash screen.
export function useAppFonts() {
  const [loaded, error] = useFonts(FONT_FILES);
  return loaded || error !== null;
}
