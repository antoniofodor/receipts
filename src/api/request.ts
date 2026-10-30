import { supabase } from '@/api/supabase-client';

type SupabaseResult<T> = { data: T | null; error: { message: string } | null };

const NETWORK_ERROR = /network request failed|failed to fetch|fetch failed/i;

// Database functions raise plain-sentence errors meant for users; only network failures need rewording.
export function toUserMessage(message: string) {
  return NETWORK_ERROR.test(message) ? 'No connection. Check your signal and try again.' : message;
}

export function unwrap<T>({ data, error }: SupabaseResult<T>): T {
  if (error) throw new Error(toUserMessage(error.message));
  return data as T;
}

export async function callFunction<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  return unwrap<T>(await supabase.rpc(name, args));
}
