import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { getRules } from '@/api/rules';
import type { Membership } from '@/api/trips';
import RulesScreen from '@/app/(app)/rules';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    router: { push: jest.fn() },
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
  };
});
let mockMembership: Partial<Membership> = {};
jest.mock('@/session/session-provider', () => ({ useMembership: () => mockMembership }));
jest.mock('@/api/rules', () => ({ getRules: jest.fn(), createRule: jest.fn() }));

describe('Rules screen', () => {
  beforeEach(() => {
    jest.mocked(getRules).mockResolvedValue([]);
    jest.mocked(router.push).mockClear();
  });

  it('opens the rule packs for the organiser', async () => {
    mockMembership = { trip_id: 'trip', player_id: 'dev', is_organiser: true };
    await renderWithQueryClient(<RulesScreen />);
    expect(await screen.findByText('No rules yet')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Rule packs' }));
    expect(router.push).toHaveBeenCalledWith('/rule-packs');
  });

  it('opens a rule for editing on long press, but only for someone who may change it', async () => {
    jest.mocked(getRules).mockResolvedValue([
      {
        id: 'straw',
        title: 'Drinking from a straw',
        points: -5,
        is_preset: true,
        created_by: null,
        created_at: '',
        pack_id: null,
        custom_pack_id: null,
      },
      {
        id: 'mine',
        title: 'Ordering pineapple on pizza',
        points: -10,
        is_preset: false,
        created_by: 'jonno',
        created_at: '',
        pack_id: null,
        custom_pack_id: null,
      },
    ]);
    mockMembership = { trip_id: 'trip', player_id: 'jonno', is_organiser: false };
    await renderWithQueryClient(<RulesScreen />);

    await fireEvent(await screen.findByLabelText('Log Drinking from a straw, −5'), 'longPress');
    expect(router.push).not.toHaveBeenCalled();

    await fireEvent(screen.getByLabelText('Log Ordering pineapple on pizza, −10'), 'longPress');
    expect(router.push).toHaveBeenCalledWith({ pathname: '/rule/[id]', params: { id: 'mine' } });
  });

  it('lets every player browse the rule packs', async () => {
    mockMembership = { trip_id: 'trip', player_id: 'jonno', is_organiser: false };
    await renderWithQueryClient(<RulesScreen />);
    expect(await screen.findByText('No rules yet')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Rule packs' }));
    expect(router.push).toHaveBeenCalledWith('/rule-packs');
  });
});
