import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { WaitBeforeNewCodeError, confirmAccountCode, sendAccountCode } from '@/api/account';
import AccountScreen from '@/app/account';
import { createTestQueryClient, renderWithQueryClient } from '@/test-utils/render-with-query-client';

let mockMode: string | undefined;
jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ mode: mockMode }),
}));
jest.mock('@/api/account', () => ({
  ...jest.requireActual('@/api/account'),
  getAccount: jest.fn().mockResolvedValue({ email: null, hasAccount: false }),
  sendAccountCode: jest.fn().mockResolvedValue(undefined),
  confirmAccountCode: jest.fn().mockResolvedValue(undefined),
}));
const mockStartOver = jest.fn().mockResolvedValue(undefined);
let mockMembership: { trip_name: string } | null = null;
jest.mock('@/session/session-provider', () => ({
  useSession: () => ({ membership: mockMembership, startOverAfterSignInChange: mockStartOver }),
}));

async function enterEmailAndCode() {
  await fireEvent.changeText(screen.getByLabelText('Email'), '  Sam@Example.com ');
  await fireEvent.press(screen.getByRole('button', { name: 'Send code' }));
  await fireEvent.changeText(await screen.findByLabelText('Code'), '123456');
}

describe('Account screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMode = undefined;
    mockMembership = { trip_name: 'Lisbon' };
  });

  it('creates an account from this phone, keeping its trip, once the emailed code is in', async () => {
    const queryClient = createTestQueryClient();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    await renderWithQueryClient(<AccountScreen />, queryClient);
    expect(screen.queryByText(/leaves Lisbon/)).toBeNull();

    await enterEmailAndCode();

    expect(sendAccountCode).toHaveBeenCalledWith('sam@example.com', 'create');
    await waitFor(() => expect(confirmAccountCode).toHaveBeenCalledWith('sam@example.com', '123456', 'create'));
    expect(router.back).toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['account'] });
    expect(mockStartOver).not.toHaveBeenCalled();
  });

  it('warns that signing in takes this phone out of its trip, then starts over as the account', async () => {
    mockMode = 'sign-in';
    await renderWithQueryClient(<AccountScreen />);
    expect(
      screen.getByText('This phone leaves Lisbon. You can rejoin it with the trip code and your PIN.'),
    ).toBeOnTheScreen();

    await enterEmailAndCode();

    await waitFor(() => expect(mockStartOver).toHaveBeenCalled());
    expect(confirmAccountCode).toHaveBeenCalledWith('sam@example.com', '123456', 'sign-in');
  });

  it('clears the code and says why when it is wrong', async () => {
    jest
      .mocked(confirmAccountCode)
      .mockRejectedValueOnce(new Error("That code didn't work. Check it, or send a new one."));
    await renderWithQueryClient(<AccountScreen />);

    await enterEmailAndCode();

    expect(await screen.findByText("That code didn't work. Check it, or send a new one.")).toBeOnTheScreen();
    expect(router.back).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled();
  });

  describe('waiting between codes', () => {
    beforeEach(() => jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] }));
    afterEach(() => jest.useRealTimers());

    it('makes you wait a minute before sending a new code, counting down', async () => {
      await renderWithQueryClient(<AccountScreen />);
      await fireEvent.changeText(screen.getByLabelText('Email'), 'sam@example.com');
      await fireEvent.press(screen.getByRole('button', { name: 'Send code' }));

      expect(await screen.findByRole('button', { name: 'New code in 1:00' })).toBeDisabled();
      await act(() => jest.advanceTimersByTime(18_000));
      expect(screen.getByRole('button', { name: 'New code in 0:42' })).toBeDisabled();

      await act(() => jest.advanceTimersByTime(42_000));
      await fireEvent.press(screen.getByRole('button', { name: 'Send a new code' }));
      expect(sendAccountCode).toHaveBeenCalledTimes(2);
    });

    it('still waits after trying another email', async () => {
      await renderWithQueryClient(<AccountScreen />);
      await fireEvent.changeText(screen.getByLabelText('Email'), 'sam@example.com');
      await fireEvent.press(screen.getByRole('button', { name: 'Send code' }));
      await fireEvent.press(await screen.findByRole('button', { name: 'Use a different email' }));

      expect(screen.getByRole('button', { name: 'Send code in 1:00' })).toBeDisabled();
    });

    it("counts down from Supabase's own wait when it refuses to send yet", async () => {
      jest.mocked(sendAccountCode).mockRejectedValueOnce(new WaitBeforeNewCodeError(42));
      await renderWithQueryClient(<AccountScreen />);
      await fireEvent.changeText(screen.getByLabelText('Email'), 'sam@example.com');
      await fireEvent.press(screen.getByRole('button', { name: 'Send code' }));

      expect(await screen.findByRole('button', { name: 'Send code in 0:42' })).toBeDisabled();
      expect(screen.queryByText(/security purposes/)).toBeNull();
    });
  });

  it("won't send a code to something that isn't an email", async () => {
    await renderWithQueryClient(<AccountScreen />);
    await fireEvent.changeText(screen.getByLabelText('Email'), 'sam@example');
    expect(screen.getByRole('button', { name: 'Send code' })).toBeDisabled();
  });
});
