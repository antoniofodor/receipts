import { createContext, use } from 'react';

import { Paper } from '@/constants/theme';
import { useGround } from '@/light-mode/light-mode-provider';

export type Surface = 'ground' | 'paper';

// Screens are ground; a Card marks everything inside it as paper. Shared text reads this to stay legible
// on both, so the same MutedText works on a receipt and on night-time asphalt.
export const SurfaceContext = createContext<Surface>('ground');

export function useSurface(override?: Surface): Surface {
  const surface = use(SurfaceContext);
  return override ?? surface;
}

export function useSurfaceColors(override?: Surface) {
  const surface = useSurface(override);
  const ground = useGround();
  return surface === 'paper'
    ? { text: Paper.ink, muted: Paper.muted, error: Paper.red }
    : { text: ground.text, muted: ground.textMuted, error: ground.error };
}
