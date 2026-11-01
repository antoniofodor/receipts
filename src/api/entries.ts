import { randomUUID } from 'expo-crypto';

import { photoLinks, toPhotos, uploadEntryPhoto, type LocalPhoto, type Photo, type StoredPhoto } from '@/api/photos';
import { callFunction, unwrap } from '@/api/request';
import { supabase } from '@/api/supabase-client';

export type EntryStatus = 'pending' | 'confirmed' | 'rejected';

type EntryPlayer = { id: string; name: string; color: string; photo_path: string | null };

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
  photos: Photo[];
  commentCount: number;
};

type EntryRow = Omit<Entry, 'photos' | 'commentCount'> & { evidence: StoredPhoto[]; comments: { count: number }[] };

export type RuleChoice = { existingRuleId: string } | { newRuleTitle: string; newRulePoints: number };

export type NewEntry = {
  tripId: string;
  subjectId: string;
  rule: RuleChoice;
  note: string;
  photos: LocalPhoto[];
};

export type VoteResult = { status: EntryStatus; confirms: number; rejects: number; threshold: number };

export const FEED_PAGE_SIZE = 50;

const ENTRY_COLUMNS = `id, points, note, status, created_at,
  subject:players!entries_subject_id_fkey(id, name, color, photo_path),
  filer:players!entries_filed_by_fkey(id, name, color, photo_path),
  rule:rules!entries_rule_id_fkey(title),
  votes:votes!votes_entry_id_fkey(confirm, voter:players!votes_voter_id_fkey(id, name)),
  evidence:evidence!evidence_entry_id_fkey(id, storage_path, width, height, created_at),
  comments:comments!comments_entry_id_fkey(count)`;

async function withPhotos(rows: EntryRow[]): Promise<Entry[]> {
  const links = await photoLinks(rows.flatMap((row) => row.evidence.map((photo) => photo.storage_path)));
  return rows.map(({ evidence, comments, ...entry }) => ({
    ...entry,
    photos: toPhotos(evidence, links),
    commentCount: comments[0]?.count ?? 0,
  }));
}

// Photos go up first, into the folder of an entry id picked here, then the entry and its photos are saved in one
// call. A failed upload leaves no entry behind, and other phones never see the entry without its photos.
export async function createEntry(entry: NewEntry) {
  const entryId = randomUUID();
  const photos = await Promise.all(
    entry.photos.map((photo, index) => uploadEntryPhoto(entry.tripId, entryId, photo, String(index + 1))),
  );
  const rule =
    'existingRuleId' in entry.rule
      ? { p_rule_id: entry.rule.existingRuleId }
      : { p_new_rule_title: entry.rule.newRuleTitle, p_new_rule_points: entry.rule.newRulePoints };
  return callFunction<string>('create_entry', {
    p_trip_id: entry.tripId,
    p_subject_id: entry.subjectId,
    ...rule,
    p_note: entry.note.trim() || null,
    p_entry_id: entryId,
    p_photos: photos,
  });
}

export const castVote = (entryId: string, confirm: boolean) =>
  callFunction<VoteResult>('cast_vote', { p_entry_id: entryId, p_confirm: confirm });

// The database can't delete stored files itself, so it hands back the entry's photos for the phone to remove.
// The entry is already gone by then: a file left behind is only clutter, never something anyone sees.
export async function deleteEntry(entryId: string) {
  const photoPaths = await callFunction<string[]>('delete_entry', { p_entry_id: entryId });
  if (photoPaths.length > 0) await supabase.storage.from('evidence').remove(photoPaths);
}

export async function getRecentEntries(tripId: string) {
  return withPhotos(
    unwrap<EntryRow[]>(
      await supabase
        .from('entries')
        .select(ENTRY_COLUMNS)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })
        .order('created_at', { referencedTable: 'evidence' })
        .limit(FEED_PAGE_SIZE),
    ),
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
  return withPhotos(
    unwrap<EntryRow[]>(
      await supabase
        .from('entries')
        .select(ENTRY_COLUMNS)
        .in(
          'id',
          awaiting.map((entry) => entry.id),
        )
        .order('created_at', { ascending: false })
        .order('created_at', { referencedTable: 'evidence' }),
    ),
  );
}

export async function getPlayerEntries(tripId: string, playerId: string) {
  return withPhotos(
    unwrap<EntryRow[]>(
      await supabase
        .from('entries')
        .select(ENTRY_COLUMNS)
        .eq('trip_id', tripId)
        .eq('subject_id', playerId)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false })
        .order('created_at', { referencedTable: 'evidence' })
        .limit(FEED_PAGE_SIZE),
    ),
  );
}

export async function getEntry(tripId: string, entryId: string): Promise<Entry | null> {
  const rows = unwrap<EntryRow[]>(
    await supabase
      .from('entries')
      .select(ENTRY_COLUMNS)
      .eq('trip_id', tripId)
      .eq('id', entryId)
      .order('created_at', { referencedTable: 'evidence' }),
  );
  const [entry] = await withPhotos(rows);
  return entry ?? null;
}
