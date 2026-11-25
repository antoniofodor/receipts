import type { CustomPack } from '@/api/custom-packs';
import type { PackRule, RulePack } from '@/api/rule-packs';
import type { Membership } from '@/api/trips';
import { comparableRuleTitle } from '@/utils/rule-search';

// Mirrors insert_rule_pack_internal: a pack rule is skipped when the trip already has a rule with that name.
export function rulesMissingFromTrip(pack: RulePack, tripRules: { title: string }[]): PackRule[] {
  const taken = new Set(tripRules.map((rule) => comparableRuleTitle(rule.title)));
  return pack.rules.filter((rule) => !taken.has(comparableRuleTitle(rule.title)));
}

// A catalog pack or one of the account's own, which a trip copies and removes the same way.
export type PackRef = { kind: 'preset' | 'custom'; id: string; name: string; rules: PackRule[] };

export const presetPackRef = (pack: RulePack): PackRef => ({ kind: 'preset', ...pack });
export const customPackRef = (pack: CustomPack): PackRef => ({ kind: 'custom', ...pack });

type RuleFromAPack = { pack_id: string | null; custom_pack_id: string | null };

// Mirrors remove_rule_pack and remove_custom_pack_from_trip: the rules that came from the pack, even if
// they've been edited since.
export const rulesFromPack = <T extends RuleFromAPack>(pack: Pick<PackRef, 'kind' | 'id'>, tripRules: T[]) =>
  tripRules.filter((rule) => (pack.kind === 'preset' ? rule.pack_id : rule.custom_pack_id) === pack.id);

// Mirrors add_rule_pack, remove_rule_pack and their custom-pack versions. Anyone can browse the packs.
export const canManageRulePacks = (membership: Pick<Membership, 'is_organiser'>) => membership.is_organiser;

// A new trip starts with the first pack in the catalog unless the organiser picks otherwise.
export const defaultRulePackIds = (packs: RulePack[]) => packs.slice(0, 1).map((pack) => pack.id);

export function toggled(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];
}
