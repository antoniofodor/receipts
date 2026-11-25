import { comparableRuleTitle } from '@/utils/rule-search';

type TitledRule = { title: string; points: number };

// Mirrors add_custom_pack_rules: a rule is skipped when the pack already has one by that name, and so is a
// repeat within the list being added.
export function rulesMissingFromPack<T extends TitledRule>(pack: { rules: TitledRule[] }, rules: T[]): T[] {
  const taken = new Set(pack.rules.map((rule) => comparableRuleTitle(rule.title)));
  return rules.filter((rule) => {
    const key = comparableRuleTitle(rule.title);
    if (taken.has(key)) return false;
    taken.add(key);
    return true;
  });
}

export const packHasRuleNamed = (pack: { rules: TitledRule[] }, title: string) =>
  pack.rules.some((rule) => comparableRuleTitle(rule.title) === comparableRuleTitle(title));
