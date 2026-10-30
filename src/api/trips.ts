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
};

export const getMyMembership = () => callFunction<Membership | null>('get_my_session');

export const getTripPreview = (code: string) => callFunction<TripPreview>('trip_preview', { p_code: code });

export const joinTrip = (code: string, playerId: string, pin: string) =>
  callFunction<JoinResult>('join_trip', { p_code: code, p_player_id: playerId, p_pin: pin });

export function createTrip(trip: NewTrip) {
  const playerNames = [trip.organiserName, ...trip.otherPlayerNames];
  const groomIndex = trip.groomName === null ? null : playerNames.indexOf(trip.groomName);
  return callFunction<{ trip_id: string; join_code: string; player_id: string }>('create_trip', {
    p_name: trip.name,
    p_player_names: playerNames,
    p_my_index: 0,
    p_pin: trip.pin,
    p_groom_index: groomIndex,
    p_vote_threshold: trip.voteThreshold,
  });
}

export const leaveTrip = () => callFunction<void>('leave_trip');
