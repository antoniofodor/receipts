import { callFunction, unwrap } from '@/api/request';
import { supabase } from '@/api/supabase-client';

export type Rule = {
  id: string;
  title: string;
  points: number;
  is_preset: boolean;
  created_by: string | null;
  created_at: string;
};

export async function getRules(tripId: string) {
  return unwrap<Rule[]>(
    await supabase
      .from('rules')
      .select('id, title, points, is_preset, created_by, created_at')
      .eq('trip_id', tripId)
      .eq('archived', false)
      .order('points')
      .order('title'),
  );
}

export const createRule = (tripId: string, title: string, points: number) =>
  callFunction<string>('create_rule', { p_trip_id: tripId, p_title: title, p_points: points });
