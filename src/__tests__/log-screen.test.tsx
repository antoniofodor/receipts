import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { createEntry } from '@/api/entries';
import LogScreen from '@/app/log';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    router: { back: jest.fn() },
    useLocalSearchParams: jest.fn(() => ({})),
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
  };
});
jest.mock('@/session/session-provider', () => ({
  useMembership: () => ({ trip_id: 'trip', player_id: 'dev', player_name: 'Dev', vote_threshold: 3 }),
}));
jest.mock('@/api/players', () => ({
  getPlayers: jest.fn().mockResolvedValue([
    { id: 'dev', name: 'Dev', color: '#000', is_groom: false },
    { id: 'jonno', name: 'Jonno', color: '#000', is_groom: false },
  ]),
}));
jest.mock('@/api/rules', () => ({
  getRules: jest.fn().mockResolvedValue([
    { id: 'straw', title: 'Drinking from a straw', points: -5, is_preset: true, created_by: null, created_at: '' },
    {
      id: 'karaoke',
      title: 'Karaoke performance, full song',
      points: 10,
      is_preset: true,
      created_by: null,
      created_at: '',
    },
  ]),
}));
jest.mock('@/api/entries', () => ({
  createEntry: jest.fn().mockResolvedValue('entry-id'),
  getRecentEntries: jest.fn(),
  getEntriesAwaitingMyVote: jest.fn(),
}));
jest.mock('@/api/leaderboard', () => ({ getLeaderboard: jest.fn() }));

const createEntryMock = jest.mocked(createEntry);

describe('Log points screen', () => {
  beforeEach(() => {
    createEntryMock.mockClear();
    jest.mocked(router.back).mockClear();
    jest.mocked(useLocalSearchParams).mockReturnValue({});
  });

  it('logs an existing rule against another player', async () => {
    await renderWithQueryClient(<LogScreen />);
    await fireEvent.press(await screen.findByLabelText('Jonno'));
    await fireEvent.press(screen.getByRole('radio', { name: 'Penalty' }));
    await fireEvent.changeText(screen.getByLabelText('Search rules'), 'straw');
    await fireEvent.press(screen.getByLabelText('Drinking from a straw, −5'));

    await fireEvent.press(screen.getByRole('button', { name: 'Log −5 for Jonno' }));

    await waitFor(() => expect(router.back).toHaveBeenCalled());
    expect(createEntryMock).toHaveBeenCalledWith({
      tripId: 'trip',
      subjectId: 'jonno',
      rule: { existingRuleId: 'straw' },
      points: -5,
      note: '',
      photos: [],
    });
  });

  it('creates a brand-new rule on the spot for a self-claim, as the kind that was picked', async () => {
    await renderWithQueryClient(<LogScreen />);
    await fireEvent.press(await screen.findByLabelText('Dev (you)'));
    await fireEvent.press(screen.getByRole('radio', { name: 'Bonus' }));
    await fireEvent.changeText(screen.getByLabelText('Search rules'), 'Carried the groom home');
    await fireEvent.press(screen.getByLabelText('Create rule Carried the groom home'));
    await fireEvent.press(screen.getByLabelText('Increase rule points'));

    await fireEvent.press(screen.getByRole('button', { name: 'Log +6 for yourself' }));

    await waitFor(() => expect(createEntryMock).toHaveBeenCalled());
    expect(createEntryMock.mock.calls[0][0]).toMatchObject({
      subjectId: 'dev',
      rule: { newRuleTitle: 'Carried the groom home', newRulePoints: 6 },
      points: 6,
    });
  });

  it('steps a new penalty along the number line', async () => {
    await renderWithQueryClient(<LogScreen />);
    await fireEvent.press(await screen.findByLabelText('Dev (you)'));
    await fireEvent.press(screen.getByRole('radio', { name: 'Penalty' }));
    await fireEvent.changeText(screen.getByLabelText('Search rules'), 'Ordering pineapple on pizza');
    await fireEvent.press(screen.getByLabelText('Create rule Ordering pineapple on pizza'));
    await fireEvent.press(screen.getByLabelText('Increase rule points'));

    expect(screen.getByRole('button', { name: 'Log −4 for yourself' })).toBeEnabled();
  });

  it('shows no rules until Penalty or Bonus is picked, then only that kind', async () => {
    await renderWithQueryClient(<LogScreen />);
    await screen.findByLabelText('Jonno');
    expect(screen.queryByLabelText('Search rules')).toBeNull();

    await fireEvent.press(screen.getByRole('radio', { name: 'Bonus' }));

    expect(screen.getByLabelText('Karaoke performance, full song, +10')).toBeTruthy();
    expect(screen.queryByLabelText('Drinking from a straw, −5')).toBeNull();
  });

  it('points to the other kind instead of offering a duplicate name', async () => {
    await renderWithQueryClient(<LogScreen />);
    await fireEvent.press(await screen.findByRole('radio', { name: 'Penalty' }));
    await fireEvent.changeText(screen.getByLabelText('Search rules'), 'karaoke performance, full song');

    expect(screen.queryByLabelText(/^Create rule/)).toBeNull();
    expect(screen.getByText('Also matches 1 bonus. Tap Bonus to see it.')).toBeTruthy();
  });

  it('does not offer to create a rule that already exists', async () => {
    await renderWithQueryClient(<LogScreen />);
    await fireEvent.press(await screen.findByRole('radio', { name: 'Penalty' }));
    await fireEvent.changeText(screen.getByLabelText('Search rules'), 'drinking from a STRAW');

    expect(screen.queryByLabelText(/^Create rule/)).toBeNull();
  });

  it('opens with the rule tapped in the rulebook already chosen', async () => {
    jest
      .mocked(useLocalSearchParams)
      .mockReturnValue({ ruleId: 'karaoke', ruleTitle: 'Karaoke performance, full song', rulePoints: '10' });
    await renderWithQueryClient(<LogScreen />);
    await fireEvent.press(await screen.findByLabelText('Jonno'));

    expect(screen.getByRole('button', { name: 'Log +10 for Jonno' })).toBeEnabled();
  });

  it('keeps the log button disabled until a player and rule are chosen', async () => {
    await renderWithQueryClient(<LogScreen />);
    await screen.findByLabelText('Jonno');

    expect(screen.getByRole('button', { name: 'Log points' })).toBeDisabled();
  });
});
