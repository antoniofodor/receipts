import { ensureSignedIn } from '@/api/auth';
import { callFunction, toUserMessage } from '@/api/request';
import { supabase } from '@/api/supabase-client';

export type Account = { email: string | null; hasAccount: boolean };

// create: turn this phone's anonymous sign-in into an account. It keeps the same user id, so the trip and
// everything else the phone owns carries over. sign-in: switch this phone to an account made elsewhere.
export type AccountPurpose = 'create' | 'sign-in';

// Supabase sends one code per sign-in a minute. Waiting this long before offering another avoids the refusal.
export const NEW_CODE_WAIT_SECONDS = 60;

export class WaitBeforeNewCodeError extends Error {
  constructor(readonly seconds: number) {
    super(`Wait ${seconds} seconds before sending another code.`);
  }
}

// Supabase's auth errors are written for developers; these are the ones people actually hit.
const AUTH_MESSAGES: [RegExp, string][] = [
  [/expired|invalid/i, "That code didn't work. Check it, or send a new one."],
  [/rate limit|security purposes|too many/i, 'Too many codes sent. Wait a few minutes and try again.'],
  [/signups not allowed|user not found/i, "There's no account with that email. Create one instead."],
  [/already been registered|already exists/i, 'That email already has an account. Sign in with it instead.'],
  [/valid email|invalid format|unable to validate email/i, "That doesn't look like an email address."],
];

function authError(message: string) {
  const wait = message.match(/after (\d+) seconds?/i);
  if (wait) return new WaitBeforeNewCodeError(Number(wait[1]));
  const known = AUTH_MESSAGES.find(([pattern]) => pattern.test(message));
  return new Error(known ? known[1] : toUserMessage(message));
}

export async function getAccount(): Promise<Account> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  const hasAccount = Boolean(user && !user.is_anonymous && user.email);
  return { email: hasAccount ? (user?.email ?? null) : null, hasAccount };
}

export async function sendAccountCode(email: string, purpose: AccountPurpose) {
  const { error } =
    purpose === 'create'
      ? await supabase.auth.updateUser({ email })
      : await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error) throw authError(error.message);
}

export async function confirmAccountCode(email: string, code: string, purpose: AccountPurpose) {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: purpose === 'create' ? 'email_change' : 'email',
  });
  if (error) throw authError(error.message);
}

// Only this phone signs out; the account stays signed in on its other phones. The phone starts again
// with a fresh anonymous sign-in, as on first open.
export async function signOutOfAccount() {
  await supabase.auth.signOut({ scope: 'local' });
  await ensureSignedIn();
}

export async function deleteAccount() {
  await callFunction<void>('delete_my_account');
  await supabase.auth.signOut({ scope: 'local' });
  await ensureSignedIn();
}
