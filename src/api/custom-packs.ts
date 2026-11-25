import { callFunction, unwrap } from '@/api/request';
import { supabase } from '@/api/supabase-client';

export type CustomPackRule = { id: string; title: string; points: number };
export type CustomPack = { id: string; name: string; rules: CustomPackRule[] };
export type NewPackRule = { title: string; points: number };

type CustomPackRow = Omit<CustomPack, 'rules'> & { custom_pack_rules: CustomPackRule[] };

// Only the signed-in account's own packs come back (RLS).
export async function getMyCustomPacks() {
  const rows = unwrap<CustomPackRow[]>(
    await supabase
      .from('custom_rule_packs')
      .select('id, name, custom_pack_rules(id, title, points)')
      .order('created_at')
      .order('points', { referencedTable: 'custom_pack_rules' })
      .order('title', { referencedTable: 'custom_pack_rules' }),
  );
  return rows.map(({ custom_pack_rules, ...pack }) => ({ ...pack, rules: custom_pack_rules }));
}

export const createCustomPack = (name: string) => callFunction<string>('create_custom_pack', { p_name: name });

export const renameCustomPack = (packId: string, name: string) =>
  callFunction<void>('rename_custom_pack', { p_pack_id: packId, p_name: name });

export const deleteCustomPack = (packId: string) => callFunction<void>('delete_custom_pack', { p_pack_id: packId });

// Rules the pack already has by name are skipped. Returns how many were added.
export const addCustomPackRules = (packId: string, rules: NewPackRule[]) =>
  callFunction<number>('add_custom_pack_rules', { p_pack_id: packId, p_rules: rules });

export const updateCustomPackRule = (ruleId: string, title: string, points: number) =>
  callFunction<void>('update_custom_pack_rule', { p_rule_id: ruleId, p_title: title, p_points: points });

export const deleteCustomPackRule = (ruleId: string) =>
  callFunction<void>('delete_custom_pack_rule', { p_rule_id: ruleId });

export const addCustomPackToTrip = (tripId: string, packId: string) =>
  callFunction<number>('add_custom_pack_to_trip', { p_trip_id: tripId, p_pack_id: packId });

export const removeCustomPackFromTrip = (tripId: string, packId: string) =>
  callFunction<number>('remove_custom_pack_from_trip', { p_trip_id: tripId, p_pack_id: packId });
