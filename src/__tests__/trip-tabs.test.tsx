import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import AddTabScreen from '@/app/(app)/add';
import TripLayout from '@/app/(app)/_layout';
import { haptics } from '@/components/haptics';

type TriggerProps = {
  name: string;
  disabled?: boolean;
  listeners?: { tabPress?: () => void };
  children?: ReactNode;
};

// Native tabs can't render in Jest, so each tab becomes a plain row that shows how it was set up.
jest.mock('expo-router/native-tabs', () => {
  const { Text, View } = jest.requireActual('react-native');
  const Trigger = ({ name, disabled, listeners }: TriggerProps) => (
    <Text accessibilityLabel={`${name} tab${disabled ? ', not selectable' : ''}`} onPress={listeners?.tabPress}>
      {name}
    </Text>
  );
  const Nothing = () => null;
  Trigger.Label = Nothing;
  Trigger.Icon = Nothing;
  Trigger.Badge = Nothing;
  const NativeTabs = ({ children }: { children: ReactNode }) => <View>{children}</View>;
  NativeTabs.Trigger = Trigger;
  return { NativeTabs };
});
jest.mock('expo-router', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    router: { push: jest.fn() },
    Redirect: ({ href }: { href: string }) => <Text>Redirecting to {href}</Text>,
  };
});
jest.mock('@/components/haptics', () => ({
  haptics: { tap: jest.fn(), tick: jest.fn(), success: jest.fn(), warning: jest.fn() },
}));
jest.mock('@/hooks/use-trip-live-updates', () => ({ useTripLiveUpdates: jest.fn() }));
jest.mock('@/hooks/use-trip-query', () => ({ useTripQuery: () => ({ data: [] }) }));
jest.mock('@/session/session-provider', () => {
  const membership = { trip_id: 'trip-1', player_id: 'sully' };
  return { useSession: () => ({ membership }), useMembership: () => membership };
});

describe('Trip tabs', () => {
  it('puts the log button in the middle of the tab bar', async () => {
    await render(<TripLayout />);

    const tabs = screen.getAllByText(/^(index|board|add|rules|me)$/).map((tab) => tab.props.children);
    expect(tabs).toEqual(['index', 'board', 'add', 'rules', 'me']);
  });

  it('opens the log sheet from the middle tab without switching to it', async () => {
    await render(<TripLayout />);

    await fireEvent.press(screen.getByLabelText('add tab, not selectable'));

    expect(router.push).toHaveBeenCalledWith('/log');
    expect(haptics.tap).toHaveBeenCalled();
  });

  it('sends a link straight to the middle tab on to the log sheet', async () => {
    await render(<AddTabScreen />);

    expect(screen.getByText('Redirecting to /log')).toBeTruthy();
  });
});
