import { callFunction, unwrap } from '@/api/request';
import { supabase } from '@/api/supabase-client';

export type Comment = {
  id: string;
  entry_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  author: { id: string; name: string; color: string };
  // Set only on the copy shown while the server is still saving it.
  sending?: boolean;
};

export const COMMENT_MAX_LENGTH = 1000;
export const COMMENTS_PAGE_SIZE = 200;

export async function getComments(tripId: string, entryId: string) {
  return unwrap<Comment[]>(
    await supabase
      .from('comments')
      .select('id, entry_id, parent_id, body, created_at, author:players!comments_author_id_fkey(id, name, color)')
      .eq('trip_id', tripId)
      .eq('entry_id', entryId)
      .order('created_at')
      .limit(COMMENTS_PAGE_SIZE),
  );
}

export const addComment = (entryId: string, body: string, parentId: string | null) =>
  callFunction<string>('add_comment', { p_entry_id: entryId, p_body: body.trim(), p_parent_id: parentId });
