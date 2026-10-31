import { callFunction, unwrap } from '@/api/request';
import { supabase } from '@/api/supabase-client';

export type EntryStatus = 'pending' | 'confirmed' | 'rejected';

type EntryPlayer = { id: string; name: string; color: string };

export type Entry = {
  id: string;
  points: number;
  note: string | null;
  status: EntryStatus;
  created_at: string;
  subject: EntryPlayer;
  filer: EntryPlayer;
  rule: { title: string };
};

export type RuleChoice = { existingRuleId: string } | { newRuleTitle: string; newRulePoints: number };

export type NewEntry = {
  tripId: string;
  subjectId: string;
  rule: RuleChoice;
  points: number;
  note: string;
};

export const FEED_PAGE_SIZE = 50;

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

export async function getRecentEntries(tripId: string) {
  return unwrap<Entry[]>(
    await supabase
      .from('entries')
      .select(
        `id, points, note, status, created_at,
         subject:players!entries_subject_id_fkey(id, name, color),
         filer:players!entries_filed_by_fkey(id, name, color),
         rule:rules!entries_rule_id_fkey(title)`,
      )
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
      .limit(FEED_PAGE_SIZE),
  );
}
