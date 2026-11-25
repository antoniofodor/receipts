import { PLAYER_NAME_MAX_LENGTH } from '@/constants/game-rules';

type NamedPlayer = { id: string; name: string };

// Same tidying the database does before storing a name.
export function normalisePlayerName(name: string) {
  return name.replace(/\s+/g, ' ').trim();
}

// Mirrors checked_player_name: why the database would refuse this name for the player, or null if it wouldn't.
// Counts characters as Postgres does, so an emoji is one, not two.
export function playerNameProblem(name: string, players: NamedPlayer[], playerId: string): string | null {
  const cleaned = normalisePlayerName(name);
  const length = [...cleaned].length;
  if (length < 1 || length > PLAYER_NAME_MAX_LENGTH) return `Names must be 1 to ${PLAYER_NAME_MAX_LENGTH} characters`;
  const lowered = cleaned.toLowerCase();
  if (players.some((player) => player.id !== playerId && player.name.toLowerCase() === lowered)) {
    return `Someone in this trip is already called "${cleaned}"`;
  }
  return null;
}

export function withPlayerRenamed<T>(rows: T[], idOf: (row: T) => string, playerId: string, name: string): T[] {
  return rows.map((row) => (idOf(row) === playerId ? { ...row, name } : row));
}
