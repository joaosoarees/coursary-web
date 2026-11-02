import { useState } from 'react';

import { TOO_MANY_REQUESTS } from '~/auth/authMessages';
import { useCooldown } from '~/components/visitor/useCooldown';
import { ApiFailure } from '~/services/ApiFailure';

const WAIT_SECONDS = 60;

export function useResendCode(send: (email: string) => Promise<unknown>) {
  const cooldown = useCooldown(WAIT_SECONDS);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string>();
  const [failure, setFailure] = useState<string>();

  const resend = async (email: string) => {
    setPending(true);
    setSentTo(undefined);
    setFailure(undefined);

    try {
      await send(email);
      setSentTo(email);
      cooldown.start();
    } catch (error) {
      setFailure(ApiFailure.message(error, { TOO_MANY_REQUESTS }));
    } finally {
      setPending(false);
    }
  };

  return { remaining: cooldown.remaining, pending, sentTo, failure, resend };
}
