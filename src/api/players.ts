import { unwrap } from '@/api/request';
import { supabase } from '@/api/supabase-client';

export type Player = {
  id: string;
  name: string;
  color: string;
  is_groom: boolean;
};

export async function getPlayers(tripId: string) {
  return unwrap<Player[]>(
    await supabase.from('players').select('id, name, color, is_groom').eq('trip_id', tripId).order('position'),
  );
}
