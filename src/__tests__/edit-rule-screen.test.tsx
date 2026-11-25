import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { deleteRule, getRules, updateRule, type Rule } from '@/api/rules';
import type { Membership } from '@/api/trips';
import EditRuleScreen from '@/app/rule/[id]';
import { createTestQueryClient, renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    router: { back: jest.fn() },
    useLocalSearchParams: () => ({ id: 'karaoke' }),
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
  };
});
let mockMembership: Partial<Membership> = {};
jest.mock('@/session/session-provider', () => ({ useMembership: () => mockMembership }));
jest.mock('@/api/rules', () => ({ getRules: jest.fn(), updateRule: jest.fn(), deleteRule: jest.fn() }));
jest.mock('@/api/entries', () => ({
  getRecentEntries: jest.fn(),
  getEntriesAwaitingMyVote: jest.fn(),
  getPlayerEntries: jest.fn(),
  getEntry: jest.fn(),
}));

const karaoke: Rule = {
  id: 'karaoke',
  title: 'Karaoke performance, full song',
  points: 10,
  is_preset: true,
  created_by: null,
  created_at: '',
  pack_id: null,
  custom_pack_id: null,
};

const updateRuleMock = jest.mocked(updateRule);
const deleteRuleMock = jest.mocked(deleteRule);

function pressAlertButton(text: string) {
  const buttons = jest.mocked(Alert.alert).mock.calls[0][2] ?? [];
  buttons.find((button) => button.text === text)?.onPress?.();
}

describe('Edit rule screen', () => {
  beforeEach(() => {
    mockMembership = { trip_id: 'trip', player_id: 'dev', is_organiser: true };
    jest.mocked(getRules).mockReset().mockResolvedValue([karaoke]);
    updateRuleMock.mockReset().mockResolvedValue(undefined);
    deleteRuleMock.mockReset().mockResolvedValue(undefined);
    jest.mocked(router.back).mockClear();
    jest.spyOn(Alert, 'alert').mockClear();
  });

  it('lets the organiser rename a pack rule and change its points, shown before the server answers', async () => {
    let answer = () => {};
    updateRuleMock.mockReturnValue(new Promise<void>((resolve) => (answer = resolve)));
    const queryClient = createTestQueryClient();
    await renderWithQueryClient(<EditRuleScreen />, queryClient);
    const save = await screen.findByRole('button', { name: 'Save rule' });
    expect(save).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Rule name'), '  Karaoke,  whole song ');
    await fireEvent.press(screen.getByRole('radio', { name: 'Penalty' }));
    expect(screen.getByText('Entries already logged keep their points.')).toBeOnTheScreen();
    await fireEvent.press(save);

    await waitFor(() => expect(updateRuleMock).toHaveBeenCalledWith('karaoke', 'Karaoke, whole song', -10));
    expect(queryClient.getQueryData<Rule[]>(['rules', 'trip'])?.[0]).toMatchObject({
      title: 'Karaoke, whole song',
      points: -10,
    });
    answer();
    await waitFor(() => expect(router.back).toHaveBeenCalled());
  });

  it('puts the rule back and says why when the server refuses an edit', async () => {
    updateRuleMock.mockRejectedValue(new Error('There\'s already a rule called "Drinking from a straw"'));
    const queryClient = createTestQueryClient();
    await renderWithQueryClient(<EditRuleScreen />, queryClient);
    await fireEvent.changeText(await screen.findByLabelText('Rule name'), 'Drinking from a straw');
    await fireEvent.press(screen.getByRole('button', { name: 'Save rule' }));

    expect(await screen.findByText('There\'s already a rule called "Drinking from a straw"')).toBeOnTheScreen();
    expect(router.back).not.toHaveBeenCalled();
    expect(queryClient.getQueryData<Rule[]>(['rules', 'trip'])?.[0].title).toBe(karaoke.title);
  });

  it('deletes the rule after asking, and it leaves the rulebook before the server answers', async () => {
    let answer = () => {};
    deleteRuleMock.mockReturnValue(new Promise<void>((resolve) => (answer = resolve)));
    const queryClient = createTestQueryClient();
    await renderWithQueryClient(<EditRuleScreen />, queryClient);
    await fireEvent.press(await screen.findByRole('button', { name: 'Delete rule' }));
    expect(deleteRuleMock).not.toHaveBeenCalled();

    pressAlertButton('Delete');

    await waitFor(() => expect(deleteRuleMock).toHaveBeenCalledWith('karaoke'));
    expect(queryClient.getQueryData<Rule[]>(['rules', 'trip'])).toEqual([]);
    answer();
    await waitFor(() => expect(router.back).toHaveBeenCalled());
  });

  it("doesn't offer the form to a player who can't change the rule", async () => {
    mockMembership = { trip_id: 'trip', player_id: 'jonno', is_organiser: false };
    await renderWithQueryClient(<EditRuleScreen />);
    expect(
      await screen.findByText('Only the organiser or the person who added this rule can change it.'),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Save rule' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Delete rule' })).toBeNull();
  });

  it('says so when the rule has been deleted elsewhere', async () => {
    jest.mocked(getRules).mockResolvedValue([]);
    await renderWithQueryClient(<EditRuleScreen />);
    expect(await screen.findByText("This rule isn't here anymore.")).toBeOnTheScreen();
  });
});
