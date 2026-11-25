import { openAccountScreen } from '@/components/account/open-account-screen';
import { Button } from '@/components/button';

type AccountButtonsProps = {
  // On screens where another action is the main one, Create account doesn't compete with it.
  quiet?: boolean;
};

export function AccountButtons({ quiet = false }: AccountButtonsProps) {
  return (
    <>
      <Button
        title="Create account"
        variant={quiet ? 'secondary' : 'primary'}
        onPress={() => openAccountScreen('create')}
      />
      <Button title="Sign in" variant="secondary" onPress={() => openAccountScreen('sign-in')} />
    </>
  );
}
