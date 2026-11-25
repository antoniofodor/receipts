import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SwipeDirection, type SwipeableProps } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { haptics } from '@/components/haptics';
import { SwipeableRow } from '@/components/swipeable-row';

let mockSwipeable: SwipeableProps;
jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => ({
  ...jest.requireActual('react-native-gesture-handler/ReanimatedSwipeable'),
  __esModule: true,
  default: (props: SwipeableProps) => {
    mockSwipeable = props;
    return props.children;
  },
}));
jest.mock('@/components/haptics', () => ({ haptics: { success: jest.fn(), warning: jest.fn() } }));

describe('SwipeableRow', () => {
  const remove = jest.fn();
  const add = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('removes when swiped left and adds when swiped right, each with its own haptic', async () => {
    await render(
      <SwipeableRow
        swipeLeft={{ label: 'Remove', tone: 'remove', onAction: remove }}
        swipeRight={{ label: 'Add', tone: 'add', onAction: add }}>
        <Text>Spilling a drink</Text>
      </SwipeableRow>,
    );

    mockSwipeable.onSwipeableOpen?.(SwipeDirection.LEFT);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(haptics.warning).toHaveBeenCalled();
    expect(add).not.toHaveBeenCalled();

    mockSwipeable.onSwipeableOpen?.(SwipeDirection.RIGHT);
    expect(add).toHaveBeenCalledTimes(1);
    expect(haptics.success).toHaveBeenCalled();
  });

  it('only opens toward the sides that have an action', async () => {
    await render(
      <SwipeableRow swipeLeft={{ label: 'Remove', tone: 'remove', onAction: remove }}>
        <Text>Spilling a drink</Text>
      </SwipeableRow>,
    );

    expect(mockSwipeable.renderRightActions).toBeDefined();
    expect(mockSwipeable.renderLeftActions).toBeUndefined();
  });
});
