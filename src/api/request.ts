import { supabase } from '@/api/supabase-client';

const NETWORK_ERROR = /network request failed|failed to fetch|fetch failed/i;

// Database functions raise plain-sentence errors meant for users; only network failures need rewording.
export function toUserMessage(message: string) {
  return NETWORK_ERROR.test(message) ? 'No connection. Check your signal and try again.' : message;
}

// Without generated database types supabase-js can't infer row shapes (embedded rows come back
// typed as arrays), so each query in src/api declares its row type here.
export function unwrap<T>({ data, error }: { data: unknown; error: { message: string } | null }): T {
  if (error) throw new Error(toUserMessage(error.message));
  return data as T;
}

export async function callFunction<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  return unwrap<T>(await supabase.rpc(name, args));
}
