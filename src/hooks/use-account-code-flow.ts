import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
  NEW_CODE_WAIT_SECONDS,
  WaitBeforeNewCodeError,
  confirmAccountCode,
  sendAccountCode,
  type AccountPurpose,
} from '@/api/account';
import { useAsyncAction } from '@/hooks/use-async-action';
import { ACCOUNT_QUERY_KEY } from '@/hooks/use-account';
import { useCountdown } from '@/hooks/use-countdown';
import { useSession } from '@/session/session-provider';
import { looksLikeEmail, normaliseEmail } from '@/utils/email';

export const ACCOUNT_CODE_LENGTH = 6;

// Email first, then the code it sends. Creating an account keeps this phone's trip; signing in swaps the
// phone over to the account, which may be in another trip or none.
export function useAccountCodeFlow(purpose: AccountPurpose, onDone: () => void) {
  const { startOverAfterSignInChange } = useSession();
  const queryClient = useQueryClient();
  const { busy, error, setError, run } = useAsyncAction();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const newCodeWait = useCountdown();

  function send() {
    run(async () => {
      const address = normaliseEmail(email);
      try {
        await sendAccountCode(address, purpose);
      } catch (caught) {
        if (!(caught instanceof WaitBeforeNewCodeError)) throw caught;
        newCodeWait.start(caught.seconds);
        return;
      }
      newCodeWait.start(NEW_CODE_WAIT_SECONDS);
      setCode('');
      setSentTo(address);
    });
  }

  function confirm(digits = code) {
    run(async () => {
      if (!sentTo) return;
      try {
        await confirmAccountCode(sentTo, digits, purpose);
      } catch (caught) {
        setCode('');
        throw caught;
      }
      onDone();
      if (purpose === 'create') await queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
      else await startOverAfterSignInChange();
    });
  }

  function changeEmail() {
    setError(null);
    setCode('');
    setSentTo(null);
  }

  return {
    email,
    setEmail,
    canSend: looksLikeEmail(email) && newCodeWait.secondsLeft === 0,
    secondsUntilNewCode: newCodeWait.secondsLeft,
    sentTo,
    code,
    setCode,
    busy,
    error,
    send,
    confirm,
    changeEmail,
  };
}
