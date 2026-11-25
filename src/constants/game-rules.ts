// Mirror the checks in supabase/migrations/0001_core.sql; the database is the source of truth.
export const RULE_POINTS_LIMIT = 25;
export const RULE_TITLE_MIN_LENGTH = 2;
export const RULE_TITLE_MAX_LENGTH = 60;
export const NOTE_MAX_LENGTH = 500;
export const DEFAULT_NEW_RULE_MAGNITUDE = 5;
// Mirrors checked_pack_name in supabase/migrations/0015_custom_rule_packs.sql.
export const PACK_NAME_MAX_LENGTH = 40;
// Mirrors checked_player_name in supabase/migrations/0016_rename_player.sql.
export const PLAYER_NAME_MAX_LENGTH = 30;
