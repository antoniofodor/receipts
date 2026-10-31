import type { Rule } from '@/api/rules';
import { RULE_TITLE_MAX_LENGTH, RULE_TITLE_MIN_LENGTH } from '@/constants/game-rules';
import { kindOfPoints, type RuleKind } from '@/utils/points';

// Same normalisation the database uses to reject duplicate rule names.
export function normaliseRuleTitle(title: string) {
  return title.replace(/\s+/g, ' ').trim();
}

const comparable = (title: string) => normaliseRuleTitle(title).toLowerCase();

export function searchRules(rules: Rule[], query: string) {
  const needle = comparable(query);
  if (!needle) return rules;
  const matches = rules.filter((rule) => comparable(rule.title).includes(needle));
  const startsWithNeedle = (rule: Rule) => (comparable(rule.title).startsWith(needle) ? 0 : 1);
  return matches.sort((a, b) => startsWithNeedle(a) - startsWithNeedle(b));
}

export function canCreateRuleNamed(rules: Rule[], query: string) {
  const title = normaliseRuleTitle(query);
  if (title.length < RULE_TITLE_MIN_LENGTH || title.length > RULE_TITLE_MAX_LENGTH) return false;
  return !rules.some((rule) => comparable(rule.title) === title.toLowerCase());
}

export function rulesOfKind(rules: Rule[], kind: RuleKind) {
  return rules
    .filter((rule) => kindOfPoints(rule.points) === kind)
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points) || a.title.localeCompare(b.title));
}
