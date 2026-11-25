import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { getAccount } from '@/api/account';
import { TripCodeStep } from '@/components/join/trip-code-step';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/api/account', () => ({ getAccount: jest.fn() }));

const renderStep = () =>
  renderWithQueryClient(
    <TripCodeStep
      code=""
      onChangeCode={jest.fn()}
      onFindTrip={jest.fn()}
      onCreateTrip={jest.fn()}
      lastTrip={null}
      busy={false}
      error={null}
    />,
  );

describe('Join screen accounts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lets a phone without an account create one before joining a trip', async () => {
    jest.mocked(getAccount).mockResolvedValue({ email: null, hasAccount: false });
    await renderStep();

    await fireEvent.press(await screen.findByRole('button', { name: 'Create account' }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/account', params: { mode: 'create' } });
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/account', params: { mode: 'sign-in' } });
  });

  it('says which account the phone is signed in to instead of offering to make one', async () => {
    jest.mocked(getAccount).mockResolvedValue({ email: 'sam@example.com', hasAccount: true });
    await renderStep();

    expect(await screen.findByText('Signed in as sam@example.com')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Create account' })).toBeNull();
  });
});
