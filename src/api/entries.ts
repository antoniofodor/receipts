import { callFunction, unwrap } from '@/api/request';
import { supabase } from '@/api/supabase-client';

export type EntryStatus = 'pending' | 'confirmed' | 'rejected';

type EntryPlayer = { id: string; name: string; color: string };

export type Vote = { confirm: boolean; voter: { id: string; name: string } };

export type Entry = {
  id: string;
  points: number;
  note: string | null;
  status: EntryStatus;
  created_at: string;
  subject: EntryPlayer;
  filer: EntryPlayer;
  rule: { title: string };
  votes: Vote[];
};

export type RuleChoice = { existingRuleId: string } | { newRuleTitle: string; newRulePoints: number };

export type NewEntry = {
  tripId: string;
  subjectId: string;
  rule: RuleChoice;
  points: number;
  note: string;
};

export type VoteResult = { status: EntryStatus; confirms: number; rejects: number; threshold: number };

export const FEED_PAGE_SIZE = 50;

const ENTRY_COLUMNS = `id, points, note, status, created_at,
  subject:players!entries_subject_id_fkey(id, name, color),
  filer:players!entries_filed_by_fkey(id, name, color),
  rule:rules!entries_rule_id_fkey(title),
  votes:votes!votes_entry_id_fkey(confirm, voter:players!votes_voter_id_fkey(id, name))`;

export function createEntry(entry: NewEntry) {
  const rule =
    'existingRuleId' in entry.rule
      ? { p_rule_id: entry.rule.existingRuleId }
      : { p_new_rule_title: entry.rule.newRuleTitle, p_new_rule_points: entry.rule.newRulePoints };
  return callFunction<string>('create_entry', {
    p_trip_id: entry.tripId,
    p_subject_id: entry.subjectId,
    ...rule,
    p_points: entry.points,
    p_note: entry.note.trim() || null,
  });
}

export const castVote = (entryId: string, confirm: boolean) =>
  callFunction<VoteResult>('cast_vote', { p_entry_id: entryId, p_confirm: confirm });

export async function getRecentEntries(tripId: string) {
  return unwrap<Entry[]>(
    await supabase
      .from('entries')
      .select(ENTRY_COLUMNS)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
      .limit(FEED_PAGE_SIZE),
  );
}

export async function getEntriesAwaitingMyVote(tripId: string) {
  const awaiting = unwrap<{ id: string }[]>(
    await supabase
      .from('entries_awaiting_my_vote')
      .select('id')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
      .limit(FEED_PAGE_SIZE),
  );
  if (awaiting.length === 0) return [];
  return unwrap<Entry[]>(
    await supabase
      .from('entries')
      .select(ENTRY_COLUMNS)
      .in(
        'id',
        awaiting.map((entry) => entry.id),
      )
      .order('created_at', { ascending: false }),
  );
}

export async function getPlayerEntries(tripId: string, playerId: string) {
  return unwrap<Entry[]>(
    await supabase
      .from('entries')
      .select(ENTRY_COLUMNS)
      .eq('trip_id', tripId)
      .eq('subject_id', playerId)
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: false })
      .limit(FEED_PAGE_SIZE),
  );
}
