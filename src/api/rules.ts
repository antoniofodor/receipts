import { callFunction, unwrap } from '@/api/request';
import { supabase } from '@/api/supabase-client';

export type Rule = {
  id: string;
  title: string;
  points: number;
  is_preset: boolean;
  created_by: string | null;
  created_at: string;
  // The pack it was copied from, if any: a catalog pack or someone's own. Kept when the rule is edited.
  pack_id: string | null;
  custom_pack_id: string | null;
};

export async function getRules(tripId: string) {
  return unwrap<Rule[]>(
    await supabase
      .from('rules')
      .select('id, title, points, is_preset, created_by, created_at, pack_id, custom_pack_id')
      .eq('trip_id', tripId)
      .eq('archived', false)
      .order('points')
      .order('title'),
  );
}

export const createRule = (tripId: string, title: string, points: number) =>
  callFunction<string>('create_rule', { p_trip_id: tripId, p_title: title, p_points: points });

export const updateRule = (ruleId: string, title: string, points: number) =>
  callFunction<void>('update_rule', { p_rule_id: ruleId, p_title: title, p_points: points });

export const deleteRule = (ruleId: string) => callFunction<void>('delete_rule', { p_rule_id: ruleId });
