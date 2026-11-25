import type { Rule } from '@/api/rules';
import type { Membership } from '@/api/trips';

// Mirrors rule_i_can_manage: whoever added the rule, or the organiser (the only one who can change pack rules).
export function canManageRule(rule: Pick<Rule, 'created_by'>, me: Pick<Membership, 'player_id' | 'is_organiser'>) {
  return rule.created_by === me.player_id || me.is_organiser;
}
