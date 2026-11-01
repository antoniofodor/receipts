import { unwrap } from '@/api/request';
import { supabase } from '@/api/supabase-client';

export type LeaderboardRow = {
  trip_id: string;
  player_id: string;
  name: string;
  color: string;
  is_groom: boolean;
  points: number;
  pending_count: number;
  rank: number;
  photo_path: string | null;
};

export async function getLeaderboard(tripId: string) {
  return unwrap<LeaderboardRow[]>(
    await supabase.from('leaderboard').select('*').eq('trip_id', tripId).order('rank').order('name'),
  );
}
