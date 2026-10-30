import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { getTripPreview, joinTrip, type PreviewPlayer, type TripPreview } from '@/api/trips';
import { describeFailedJoin } from '@/components/join/describe-failed-join';
import { PinStep } from '@/components/join/pin-step';
import { PlayerStep } from '@/components/join/player-step';
import { TripCodeStep } from '@/components/join/trip-code-step';
import { Screen } from '@/components/screen';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useSession } from '@/session/session-provider';
import { readLastTrip, type LastTrip } from '@/session/session-storage';

export default function JoinScreen() {
  const { reloadMembership } = useSession();
  const { busy, error, setError, run } = useAsyncAction();
  const [code, setCode] = useState('');
  const [trip, setTrip] = useState<TripPreview | null>(null);
  const [player, setPlayer] = useState<PreviewPlayer | null>(null);
  const [pin, setPin] = useState('');
  const [lastTrip, setLastTrip] = useState<LastTrip | null>(null);

  useEffect(() => {
    readLastTrip().then(setLastTrip);
  }, []);

  function findTrip(tripCode: string) {
    run(async () => {
      setCode(tripCode);
      setTrip(await getTripPreview(tripCode));
    });
  }

  function join() {
    run(async () => {
      if (!player) return;
      const result = await joinTrip(code, player.id, pin);
      if (result.ok) {
        await reloadMembership();
        return;
      }
      setPin('');
      setError(describeFailedJoin(result, player.name));
    });
  }

  function goBack() {
    setError(null);
    setPin('');
    if (player) setPlayer(null);
    else setTrip(null);
  }

  let step;
  if (!trip) {
    step = (
      <TripCodeStep
        code={code}
        onChangeCode={setCode}
        onFindTrip={findTrip}
        onCreateTrip={() => router.push('/create-trip')}
        lastTrip={lastTrip}
        busy={busy}
        error={error}
      />
    );
  } else if (!player) {
    step = <PlayerStep trip={trip} onPickPlayer={setPlayer} onBack={goBack} />;
  } else {
    step = (
      <PinStep
        tripName={trip.name}
        player={player}
        pin={pin}
        onChangePin={setPin}
        onJoin={join}
        onBack={goBack}
        busy={busy}
        error={error}
      />
    );
  }

  return <Screen>{step}</Screen>;
}
