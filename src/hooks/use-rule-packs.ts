import { useQuery } from '@tanstack/react-query';

import { getRulePacks } from '@/api/rule-packs';
import { errorMessage } from '@/utils/errors';

const RULE_PACKS_KEY = ['rule-packs'];
const AN_HOUR = 60 * 60 * 1000;

// Not a trip query: the catalog is the same for everyone and is read before a trip exists.
export function useRulePacks() {
  const result = useQuery({ queryKey: RULE_PACKS_KEY, queryFn: getRulePacks, staleTime: AN_HOUR });
  return {
    packs: result.data ?? null,
    loading: result.isPending,
    error: result.error ? errorMessage(result.error) : null,
  };
}
