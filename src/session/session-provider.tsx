import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { ensureSignedIn } from '@/api/auth';
import { getMyMembership, leaveTrip, type Membership } from '@/api/trips';
import { readSavedMembership, saveMembership } from '@/session/session-storage';
import { errorMessage } from '@/utils/errors';

type SessionContextValue = {
  isLoading: boolean;
  membership: Membership | null;
  startupError: string | null;
  retryStartup: () => void;
  reloadMembership: () => Promise<void>;
  leave: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const value = use(SessionContext);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}

export function useMembership() {
  const { membership } = useSession();
  if (!membership) throw new Error('useMembership is only available on screens behind the trip guard');
  return membership;
}

async function fetchMembership() {
  await ensureSignedIn();
  const membership = await getMyMembership();
  await saveMembership(membership);
  return membership;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [startupAttempt, setStartupAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStartupError(null);
      // Open straight into the saved trip so the app works offline, then confirm with the server.
      const saved = await readSavedMembership();
      if (saved && !cancelled) {
        setMembership(saved);
        setIsLoading(false);
      }
      try {
        const fresh = await fetchMembership();
        if (!cancelled) setMembership(fresh);
      } catch (error) {
        if (!saved && !cancelled) setStartupError(errorMessage(error));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [startupAttempt]);

  async function reloadMembership() {
    setMembership(await fetchMembership());
  }

  async function leave() {
    await leaveTrip();
    await saveMembership(null);
    setMembership(null);
  }

  return (
    <SessionContext
      value={{
        isLoading,
        membership,
        startupError,
        retryStartup: () => setStartupAttempt((attempt) => attempt + 1),
        reloadMembership,
        leave,
      }}>
      {children}
    </SessionContext>
  );
}
