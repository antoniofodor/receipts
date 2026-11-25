import { addCustomPackToTrip } from '@/api/custom-packs';
import { callFunction } from '@/api/request';

export type Membership = {
  trip_id: string;
  player_id: string;
  trip_name: string;
  join_code: string;
  vote_threshold: number;
  player_name: string;
  is_organiser: boolean;
  is_groom: boolean;
};

export type PreviewPlayer = {
  id: string;
  name: string;
  color: string;
  is_groom: boolean;
  photo_path: string | null;
  has_joined: boolean;
};

export type TripPreview = {
  trip_id: string;
  name: string;
  players: PreviewPlayer[];
};

export type JoinResult =
  | { ok: true; trip_id: string; player_id: string }
  | { ok: false; error: 'wrong_pin'; attempts_left: number }
  | { ok: false; error: 'locked'; retry_after_seconds: number };

export type NewTrip = {
  name: string;
  organiserName: string;
  otherPlayerNames: string[];
  groomName: string | null;
  voteThreshold: number;
  pin: string;
  // Left out, the trip starts with the server's default pack.
  rulePackIds?: string[];
  // The organiser's own packs, copied in once the trip exists.
  customPackIds?: string[];
};

export const getMyMembership = () => callFunction<Membership | null>('get_my_session');

export const getTripPreview = (code: string) => callFunction<TripPreview>('trip_preview', { p_code: code });

export const joinTrip = (code: string, playerId: string, pin: string) =>
  callFunction<JoinResult>('join_trip', { p_code: code, p_player_id: playerId, p_pin: pin });

export async function createTrip(trip: NewTrip) {
  const playerNames = [trip.organiserName, ...trip.otherPlayerNames];
  const groomIndex = trip.groomName === null ? null : playerNames.indexOf(trip.groomName);
  const created = await callFunction<{ trip_id: string; join_code: string; player_id: string }>('create_trip', {
    p_name: trip.name,
    p_player_names: playerNames,
    p_my_index: 0,
    p_pin: trip.pin,
    p_groom_index: groomIndex,
    p_vote_threshold: trip.voteThreshold,
    p_rule_pack_ids: trip.rulePackIds,
  });
  // After the catalog packs, so where two share a rule name the catalog's points win, as in create_trip.
  for (const packId of trip.customPackIds ?? []) await addCustomPackToTrip(created.trip_id, packId);
  return created;
}

export const leaveTrip = () => callFunction<void>('leave_trip');
