import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { addRulePack, removeRulePack } from '@/api/rule-packs';
import { getRules, type Rule } from '@/api/rules';
import type { Membership } from '@/api/trips';
import RulePacksScreen from '@/app/rule-packs';
import { createTestQueryClient, renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    router: { back: jest.fn() },
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
  };
});
let mockMembership: Partial<Membership> = {};
jest.mock('@/session/session-provider', () => ({ useMembership: () => mockMembership }));
jest.mock('@/api/rule-packs', () => ({
  getRulePacks: jest.fn().mockResolvedValue([
    {
      id: 'cabin-weekend',
      name: 'Cabin weekend',
      rules: [
        { title: 'First to arrive', points: 10 },
        { title: 'Spilling a drink', points: -5 },
        { title: 'Throwing up', points: -25 },
      ],
    },
  ]),
  addRulePack: jest.fn(),
  removeRulePack: jest.fn(),
}));
jest.mock('@/api/rules', () => ({ getRules: jest.fn() }));

const addRulePackMock = jest.mocked(addRulePack);
const removeRulePackMock = jest.mocked(removeRulePack);
const getRulesMock = jest.mocked(getRules);

const tripRule = (title: string): Rule => ({
  id: title,
  title,
  points: -5,
  is_preset: false,
  created_by: 'dev',
  created_at: '',
  pack_id: null,
  custom_pack_id: null,
});

describe('Rule packs screen', () => {
  beforeEach(() => {
    mockMembership = { trip_id: 'trip', player_id: 'dev', is_organiser: true };
    addRulePackMock.mockReset();
    removeRulePackMock.mockReset();
    jest.spyOn(Alert, 'alert').mockClear();
    getRulesMock.mockReset().mockResolvedValue([tripRule('spilling a drink')]);
  });

  it("offers the organiser only the rules the trip doesn't have yet", async () => {
    await renderWithQueryClient(<RulePacksScreen />);
    expect(await screen.findByRole('button', { name: 'Add 2 rules' })).toBeOnTheScreen();
  });

  it('shows the pack as added straight away, before the server answers', async () => {
    addRulePackMock.mockReturnValue(new Promise(() => {}));
    await renderWithQueryClient(<RulePacksScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Add 2 rules' }));

    expect(addRulePackMock).toHaveBeenCalledWith('trip', 'cabin-weekend');
    expect(await screen.findByRole('button', { name: 'All added' })).toBeOnTheScreen();
  });

  it('takes the rules back out and says why when the server refuses', async () => {
    addRulePackMock.mockRejectedValue(new Error('Only the organiser can add rule packs'));
    await renderWithQueryClient(<RulePacksScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Add 2 rules' }));

    expect(await screen.findByText('Only the organiser can add rule packs')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Add 2 rules' })).toBeEnabled();
  });

  it('takes every rule from the pack back out after asking, edited ones too, before the server answers', async () => {
    getRulesMock.mockResolvedValue([
      { ...tripRule('First one there'), pack_id: 'cabin-weekend' },
      { ...tripRule('Throwing up'), pack_id: 'cabin-weekend' },
      tripRule('Ordering pineapple on pizza'),
    ]);
    removeRulePackMock.mockReturnValue(new Promise(() => {}));
    const queryClient = createTestQueryClient();
    await renderWithQueryClient(<RulePacksScreen />, queryClient);

    await fireEvent.press(await screen.findByRole('button', { name: 'Remove 2 rules' }));
    expect(removeRulePackMock).not.toHaveBeenCalled();
    const [, , buttons = []] = jest.mocked(Alert.alert).mock.calls[0];
    buttons.find((button) => button.text === 'Remove')?.onPress?.();

    await waitFor(() => expect(removeRulePackMock).toHaveBeenCalledWith('trip', 'cabin-weekend'));
    expect(queryClient.getQueryData<Rule[]>(['rules', 'trip'])?.map((rule) => rule.title)).toEqual([
      'Ordering pineapple on pizza',
    ]);
  });

  it('offers no removal for a pack with no rules on the trip', async () => {
    await renderWithQueryClient(<RulePacksScreen />);
    await screen.findByRole('button', { name: 'Add 2 rules' });
    expect(screen.queryByRole('button', { name: /^Remove/ })).toBeNull();
  });

  it('lets other players look at packs but not add them', async () => {
    mockMembership = { ...mockMembership, is_organiser: false };
    await renderWithQueryClient(<RulePacksScreen />);
    expect(await screen.findByText('Cabin weekend')).toBeOnTheScreen();
    expect(screen.getByText('Only the organiser can add or remove rule packs.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /^Add/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Remove/ })).toBeNull();
  });
});
