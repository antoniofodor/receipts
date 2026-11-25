import { useRef, type ReactNode } from 'react';
import { StyleSheet, Text, View, type AccessibilityActionEvent, type ViewProps } from 'react-native';
import ReanimatedSwipeable, {
  SwipeDirection,
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { haptics } from '@/components/haptics';
import { Fonts, Paper, Spacing } from '@/constants/theme';

export type SwipeAction = {
  label: string;
  tone: 'add' | 'remove';
  onAction: () => void;
};

type SwipeActions = {
  // What happens when the row is swiped all the way to the left, and to the right.
  swipeLeft?: SwipeAction;
  swipeRight?: SwipeAction;
};

const PANEL_WIDTH = 104;

// A row on a receipt that does something when swiped far enough, without a button to tap afterwards.
// Screen readers can't swipe, so the row inside must also offer the same actions (screenReaderSwipeActions).
export function SwipeableRow({ swipeLeft, swipeRight, children }: SwipeActions & { children: ReactNode }) {
  const swipeable = useRef<SwipeableMethods>(null);

  function act(direction: SwipeDirection) {
    const action = direction === SwipeDirection.LEFT ? swipeLeft : swipeRight;
    swipeable.current?.close();
    if (!action) return;
    if (action.tone === 'add') haptics.success();
    else haptics.warning();
    action.onAction();
  }

  return (
    <ReanimatedSwipeable
      ref={swipeable}
      friction={1.5}
      leftThreshold={PANEL_WIDTH * 0.75}
      rightThreshold={PANEL_WIDTH * 0.75}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableOpen={act}
      childrenContainerStyle={styles.row}
      renderLeftActions={swipeRight ? () => <ActionPanel action={swipeRight} side="left" /> : undefined}
      renderRightActions={swipeLeft ? () => <ActionPanel action={swipeLeft} side="right" /> : undefined}>
      {children}
    </ReanimatedSwipeable>
  );
}

function ActionPanel({ action, side }: { action: SwipeAction; side: 'left' | 'right' }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.panel,
        { backgroundColor: action.tone === 'add' ? Paper.green : Paper.red },
        side === 'left' ? styles.panelLeft : styles.panelRight,
      ]}>
      <Text style={styles.panelText}>{action.label}</Text>
    </View>
  );
}

export function screenReaderSwipeActions({
  swipeLeft,
  swipeRight,
}: SwipeActions): Pick<ViewProps, 'accessibilityActions' | 'onAccessibilityAction'> {
  const actions = [swipeLeft, swipeRight].filter((action): action is SwipeAction => action !== undefined);
  return {
    accessibilityActions: actions.map((action) => ({ name: action.label, label: action.label })),
    onAccessibilityAction: (event: AccessibilityActionEvent) => {
      actions.find((action) => action.label === event.nativeEvent.actionName)?.onAction();
    },
  };
}

const styles = StyleSheet.create({
  row: { backgroundColor: Paper.paper },
  panel: { width: PANEL_WIDTH, justifyContent: 'center', paddingHorizontal: Spacing.md },
  panelLeft: { alignItems: 'flex-start' },
  panelRight: { alignItems: 'flex-end' },
  panelText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Paper.paper,
  },
});
