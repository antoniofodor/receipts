import type { AccountPurpose } from '@/api/account';

// The account screen opens for creating an account unless the link asks to sign in.
export const accountPurposeFrom = (mode: string | undefined): AccountPurpose =>
  mode === 'sign-in' ? 'sign-in' : 'create';
