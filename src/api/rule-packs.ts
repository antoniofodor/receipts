import { callFunction, unwrap } from '@/api/request';
import { supabase } from '@/api/supabase-client';

export type PackRule = { title: string; points: number };

export type RulePack = { id: string; name: string; rules: PackRule[] };

type RulePackRow = { id: string; name: string; rule_pack_rules: PackRule[] };

// The catalog isn't tied to a trip, so it can be read before joining one.
export async function getRulePacks(): Promise<RulePack[]> {
  const rows = unwrap<RulePackRow[]>(
    await supabase
      .from('rule_packs')
      .select('id, name, rule_pack_rules(title, points)')
      .order('position')
      .order('position', { referencedTable: 'rule_pack_rules' }),
  );
  return rows.map(({ rule_pack_rules, ...pack }) => ({ ...pack, rules: rule_pack_rules }));
}

// Returns how many rules were added; ones the trip already has by name are skipped.
export const addRulePack = (tripId: string, packId: string) =>
  callFunction<number>('add_rule_pack', { p_trip_id: tripId, p_pack_id: packId });

// Returns how many rules were removed: every one that came from the pack, edited or not.
export const removeRulePack = (tripId: string, packId: string) =>
  callFunction<number>('remove_rule_pack', { p_trip_id: tripId, p_pack_id: packId });
