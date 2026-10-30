import { toUserMessage } from '@/api/request';
import { supabase } from '@/api/supabase-client';

export async function ensureSignedIn() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return;
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw new Error(toUserMessage(error.message));
}
