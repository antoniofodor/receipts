import {
  WaitBeforeNewCodeError,
  confirmAccountCode,
  getAccount,
  sendAccountCode,
  signOutOfAccount,
} from '@/api/account';
import { ensureSignedIn } from '@/api/auth';
import { supabase } from '@/api/supabase-client';

jest.mock('@/api/auth', () => ({ ensureSignedIn: jest.fn() }));
jest.mock('@/api/request', () => ({ callFunction: jest.fn(), toUserMessage: (message: string) => message }));
jest.mock('@/api/supabase-client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      updateUser: jest.fn().mockResolvedValue({ error: null }),
      signInWithOtp: jest.fn().mockResolvedValue({ error: null }),
      verifyOtp: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

const auth = jest.mocked(supabase.auth);

describe('accounts', () => {
  beforeEach(() => jest.clearAllMocks());

  it("treats the phone's anonymous sign-in as having no account", async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { user: { is_anonymous: true, email: undefined } } },
    } as never);
    expect(await getAccount()).toEqual({ email: null, hasAccount: false });

    auth.getSession.mockResolvedValue({
      data: { session: { user: { is_anonymous: false, email: 'sam@example.com' } } },
    } as never);
    expect(await getAccount()).toEqual({ email: 'sam@example.com', hasAccount: true });
  });

  it('creates an account by adding an email to this sign-in, so the user id and its trip stay the same', async () => {
    await sendAccountCode('sam@example.com', 'create');
    await confirmAccountCode('sam@example.com', '123456', 'create');

    expect(auth.updateUser).toHaveBeenCalledWith({ email: 'sam@example.com' });
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
    expect(auth.verifyOtp).toHaveBeenCalledWith({ email: 'sam@example.com', token: '123456', type: 'email_change' });
  });

  it('signs in to an existing account without creating one', async () => {
    await sendAccountCode('sam@example.com', 'sign-in');
    await confirmAccountCode('sam@example.com', '123456', 'sign-in');

    expect(auth.signInWithOtp).toHaveBeenCalledWith({ email: 'sam@example.com', options: { shouldCreateUser: false } });
    expect(auth.verifyOtp).toHaveBeenCalledWith({ email: 'sam@example.com', token: '123456', type: 'email' });
  });

  it('says what went wrong in plain words', async () => {
    auth.verifyOtp.mockResolvedValueOnce({ error: { message: 'Token has expired or is invalid' } } as never);
    await expect(confirmAccountCode('sam@example.com', '000000', 'sign-in')).rejects.toThrow(
      "That code didn't work. Check it, or send a new one.",
    );
    auth.updateUser.mockResolvedValueOnce({
      error: { message: 'A user with this email address has already been registered' },
    } as never);
    await expect(sendAccountCode('sam@example.com', 'create')).rejects.toThrow(
      'That email already has an account. Sign in with it instead.',
    );
  });

  it("says how long to wait when Supabase won't send another code yet", async () => {
    auth.updateUser.mockResolvedValueOnce({
      error: { message: 'For security purposes, you can only request this after 42 seconds.' },
    } as never);
    const sending = sendAccountCode('sam@example.com', 'create');
    await expect(sending).rejects.toBeInstanceOf(WaitBeforeNewCodeError);
    await expect(sending).rejects.toMatchObject({ seconds: 42 });
  });

  it('signs out on this phone only, then starts over with a fresh anonymous sign-in', async () => {
    await signOutOfAccount();
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(ensureSignedIn).toHaveBeenCalled();
  });
});
