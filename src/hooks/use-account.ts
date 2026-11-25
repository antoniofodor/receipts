import { useQuery } from '@tanstack/react-query';

import { getAccount } from '@/api/account';

export const ACCOUNT_QUERY_KEY = ['account'] as const;

// Whether this phone is signed in to an account, and as whom. Read from the stored session, so it's instant.
export function useAccount() {
  const { data } = useQuery({ queryKey: ACCOUNT_QUERY_KEY, queryFn: getAccount, staleTime: Infinity });
  return data ?? null;
}
