import { supabase } from '@/api/supabase-client';

export type LiveTable = 'entries' | 'votes' | 'rules' | 'comments' | 'evidence';

type TripChangeHandlers = {
  onChange: (table: LiveTable) => void;
  // Fires once database changes are actually flowing, on first connect and after every reconnect.
  // Changes made before that moment are never delivered, so this is the cue to refetch.
  onLive: () => void;
};

// Realtime applies the tables' RLS policies, so a phone only hears about its own trip.
export function subscribeToTripChanges(tripId: string, tables: LiveTable[], { onChange, onLive }: TripChangeHandlers) {
  const channel = supabase.channel(`trip:${tripId}`);
  for (const table of tables) {
    channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `trip_id=eq.${tripId}` }, () =>
      onChange(table),
    );
  }
  channel.on('system', {}, (message: { extension?: string; status?: string }) => {
    if (message.extension === 'postgres_changes' && message.status === 'ok') onLive();
  });
  channel.subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
