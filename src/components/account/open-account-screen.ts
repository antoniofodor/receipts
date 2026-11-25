import { router } from 'expo-router';

import type { AccountPurpose } from '@/api/account';

export const openAccountScreen = (purpose: AccountPurpose) =>
  router.push({ pathname: '/account', params: { mode: purpose } });
