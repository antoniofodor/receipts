import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { getAccount } from '@/api/account';
import {
  addCustomPackRules,
  createCustomPack,
  deleteCustomPackRule,
  getMyCustomPacks,
  type CustomPack,
} from '@/api/custom-packs';
import { AddPackRules } from '@/components/custom-packs/add-pack-rules';
import { MyRulePacks } from '@/components/custom-packs/my-rule-packs';
import { PackRuleList } from '@/components/custom-packs/pack-rule-list';
import { createTestQueryClient, renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/api/account', () => ({ getAccount: jest.fn() }));
jest.mock('@/api/custom-packs', () => ({
  getMyCustomPacks: jest.fn(),
  createCustomPack: jest.fn(),
  addCustomPackRules: jest.fn(),
  deleteCustomPackRule: jest.fn(),
}));
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
}));
jest.mock('@/session/session-provider', () => ({ useMembership: () => ({ trip_id: 'trip', is_organiser: true }) }));
jest.mock('@/api/rules', () => ({ getRules: jest.fn().mockResolvedValue([]) }));

const skiTrip: CustomPack = {
  id: 'ski',
  name: 'Ski trip',
  rules: [{ id: 'r1', title: 'Spilling a drink', points: -5 }],
};

describe('Your rule packs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getMyCustomPacks).mockResolvedValue([skiTrip]);
  });

  it('asks for an account before showing any packs', async () => {
    jest.mocked(getAccount).mockResolvedValue({ email: null, hasAccount: false });
    await renderWithQueryClient(<MyRulePacks tripRules={null} />);

    expect(await screen.findByText('Create an account or sign in to save your own rule packs.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/account', params: { mode: 'create' } });
    expect(getMyCustomPacks).not.toHaveBeenCalled();
  });

  it('lists the account’s packs and makes new ones, opening them to fill in', async () => {
    jest.mocked(getAccount).mockResolvedValue({ email: 'sam@example.com', hasAccount: true });
    jest.mocked(createCustomPack).mockResolvedValue('new-pack');
    await renderWithQueryClient(<MyRulePacks tripRules={null} />);

    expect(await screen.findByText('Ski trip')).toBeOnTheScreen();
    expect(screen.queryByLabelText('New pack name')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'New pack' }));
    await fireEvent.changeText(screen.getByLabelText('New pack name'), 'Festival');
    await fireEvent.press(screen.getByRole('button', { name: 'Create pack' }));

    await waitFor(() => expect(createCustomPack).toHaveBeenCalledWith('Festival'));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/custom-pack/[id]', params: { id: 'new-pack' } });
  });

  it('puts the name field away again on Cancel', async () => {
    jest.mocked(getAccount).mockResolvedValue({ email: 'sam@example.com', hasAccount: true });
    await renderWithQueryClient(<MyRulePacks tripRules={null} />);

    await fireEvent.press(await screen.findByRole('button', { name: 'New pack' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByLabelText('New pack name')).toBeNull();
    expect(createCustomPack).not.toHaveBeenCalled();
  });
});

describe('Adding rules to a pack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getAccount).mockResolvedValue({ email: 'sam@example.com', hasAccount: true });
    jest.mocked(getMyCustomPacks).mockResolvedValue([skiTrip]);
  });

  it('picks rules from a preset pack, skipping ones the pack has, and shows them in the pack at once', async () => {
    jest.mocked(addCustomPackRules).mockReturnValue(new Promise(() => {}));
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['custom-packs'], [skiTrip]);
    await renderWithQueryClient(<AddPackRules pack={skiTrip} />, queryClient);

    await fireEvent.press(await screen.findByRole('button', { name: 'Cabin weekend, 3 rules' }));
    expect(screen.getByRole('checkbox', { name: 'Spilling a drink, −5' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Pick all' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Add 2 rules' }));

    expect(addCustomPackRules).toHaveBeenCalledWith('ski', [
      { title: 'First to arrive', points: 10 },
      { title: 'Throwing up', points: -25 },
    ]);
    await waitFor(() =>
      expect(queryClient.getQueryData<CustomPack[]>(['custom-packs'])?.[0].rules.map((rule) => rule.title)).toEqual([
        'Spilling a drink',
        'First to arrive',
        'Throwing up',
      ]),
    );
  });
});

describe('Preset packs in the pack editor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getAccount).mockResolvedValue({ email: 'sam@example.com', hasAccount: true });
  });

  it('starts folded and shows how many of its rules are picked once closed again', async () => {
    await renderWithQueryClient(<AddPackRules pack={skiTrip} />);

    const header = await screen.findByRole('button', { name: 'Cabin weekend, 3 rules' });
    expect(header).toBeCollapsed();
    expect(screen.queryByRole('checkbox')).toBeNull();

    await fireEvent.press(header);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'First to arrive, +10' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Hide the Cabin weekend rules' }));

    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.getByRole('button', { name: 'Cabin weekend, 3 rules · 1 picked' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Add 1 rule' })).toBeEnabled();
  });

  it('adds a rule swiped right on its own, straight away', async () => {
    jest.mocked(addCustomPackRules).mockReturnValue(new Promise(() => {}));
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['custom-packs'], [skiTrip]);
    await renderWithQueryClient(<AddPackRules pack={skiTrip} />, queryClient);

    await fireEvent.press(await screen.findByRole('button', { name: 'Cabin weekend, 3 rules' }));
    await fireEvent(screen.getByRole('checkbox', { name: 'Throwing up, −25' }), 'accessibilityAction', {
      nativeEvent: { actionName: 'Add' },
    });

    expect(addCustomPackRules).toHaveBeenCalledWith('ski', [{ title: 'Throwing up', points: -25 }]);
    await waitFor(() =>
      expect(queryClient.getQueryData<CustomPack[]>(['custom-packs'])?.[0].rules.map((rule) => rule.title)).toEqual([
        'Spilling a drink',
        'Throwing up',
      ]),
    );
  });

  it('offers no swipe on a rule the pack already has', async () => {
    await renderWithQueryClient(<AddPackRules pack={skiTrip} />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Cabin weekend, 3 rules' }));

    expect(screen.getByRole('checkbox', { name: 'Spilling a drink, −5' }).props.accessibilityActions).toEqual([]);
  });
});

describe('The pack’s own rules', () => {
  const twoRules: CustomPack = {
    ...skiTrip,
    rules: [...skiTrip.rules, { id: 'r2', title: 'First to arrive', points: 10 }],
  };

  beforeEach(() => jest.clearAllMocks());

  async function swipeAway(title: string) {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['custom-packs'], [twoRules]);
    await renderWithQueryClient(<PackRuleList pack={twoRules} />, queryClient);
    await fireEvent(screen.getByRole('button', { name: `Edit ${title}` }), 'accessibilityAction', {
      nativeEvent: { actionName: 'Remove' },
    });
    return queryClient;
  }

  const ruleTitles = (queryClient: ReturnType<typeof createTestQueryClient>) =>
    queryClient.getQueryData<CustomPack[]>(['custom-packs'])?.[0].rules.map((rule) => rule.title);

  it('removes a rule swiped left at once', async () => {
    jest.mocked(deleteCustomPackRule).mockReturnValue(new Promise(() => {}));
    const queryClient = await swipeAway('First to arrive, +10');

    expect(deleteCustomPackRule).toHaveBeenCalledWith('r2');
    await waitFor(() => expect(ruleTitles(queryClient)).toEqual(['Spilling a drink']));
  });

  it('puts the rule back and says why when the server refuses', async () => {
    jest.mocked(deleteCustomPackRule).mockRejectedValue(new Error('Only the pack’s owner can change it'));
    const queryClient = await swipeAway('First to arrive, +10');

    expect(await screen.findByText('Only the pack’s owner can change it')).toBeOnTheScreen();
    expect(ruleTitles(queryClient)).toEqual(['Spilling a drink', 'First to arrive']);
  });
});
