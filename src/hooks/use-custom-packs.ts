import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addCustomPackRules,
  createCustomPack,
  deleteCustomPack,
  deleteCustomPackRule,
  getMyCustomPacks,
  renameCustomPack,
  updateCustomPackRule,
  type CustomPack,
  type NewPackRule,
} from '@/api/custom-packs';
import { useAccount } from '@/hooks/use-account';
import { errorMessage } from '@/utils/errors';
import { rulesMissingFromPack } from '@/utils/custom-packs';

export const CUSTOM_PACKS_KEY = ['custom-packs'] as const;

// Not a trip query: an account's packs go with it from trip to trip. Only read once there's an account.
export function useCustomPacks() {
  const account = useAccount();
  const result = useQuery({
    queryKey: CUSTOM_PACKS_KEY,
    queryFn: getMyCustomPacks,
    enabled: account?.hasAccount === true,
  });
  return {
    packs: result.data ?? null,
    error: result.error ? errorMessage(result.error) : null,
  };
}

// Every change shows in the cache straight away, is undone if the server refuses, then the server's
// version replaces the guess.
export function useCustomPackChanges() {
  const queryClient = useQueryClient();

  async function optimistically(update: (packs: CustomPack[]) => CustomPack[], send: () => Promise<unknown>) {
    await queryClient.cancelQueries({ queryKey: CUSTOM_PACKS_KEY });
    const previous = queryClient.getQueryData<CustomPack[]>(CUSTOM_PACKS_KEY);
    if (previous) queryClient.setQueryData(CUSTOM_PACKS_KEY, update(previous));
    try {
      await send();
    } catch (caught) {
      queryClient.setQueryData(CUSTOM_PACKS_KEY, previous);
      throw caught;
    }
    queryClient.invalidateQueries({ queryKey: CUSTOM_PACKS_KEY });
  }

  const inPack = (packId: string, change: (pack: CustomPack) => CustomPack) => (packs: CustomPack[]) =>
    packs.map((pack) => (pack.id === packId ? change(pack) : pack));

  return {
    // Waits for the server: the new pack's id comes from it.
    async create(name: string) {
      const id = await createCustomPack(name);
      await queryClient.invalidateQueries({ queryKey: CUSTOM_PACKS_KEY });
      return id;
    },
    rename: (packId: string, name: string) =>
      optimistically(
        inPack(packId, (pack) => ({ ...pack, name })),
        () => renameCustomPack(packId, name),
      ),
    remove: (packId: string) =>
      optimistically(
        (packs) => packs.filter((pack) => pack.id !== packId),
        () => deleteCustomPack(packId),
      ),
    addRules: (packId: string, rules: NewPackRule[]) =>
      optimistically(
        inPack(packId, (pack) => ({
          ...pack,
          rules: [
            ...pack.rules,
            ...rulesMissingFromPack(pack, rules).map((rule) => ({ ...rule, id: `new:${rule.title}` })),
          ],
        })),
        () => addCustomPackRules(packId, rules),
      ),
    updateRule: (packId: string, ruleId: string, rule: NewPackRule) =>
      optimistically(
        inPack(packId, (pack) => ({
          ...pack,
          rules: pack.rules.map((each) => (each.id === ruleId ? { ...each, ...rule } : each)),
        })),
        () => updateCustomPackRule(ruleId, rule.title, rule.points),
      ),
    removeRule: (packId: string, ruleId: string) =>
      optimistically(
        inPack(packId, (pack) => ({ ...pack, rules: pack.rules.filter((rule) => rule.id !== ruleId) })),
        () => deleteCustomPackRule(ruleId),
      ),
  };
}
