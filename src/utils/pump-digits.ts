import { MINUS_SIGN } from '@/utils/format';

const PUMP_DIGITS = 3;

export type PumpDigits = { sign: string; unlit: string; lit: string; spoken: string };

// A pump shows every number at least three digits wide; the leading zeros are segments that aren't lit.
export function pumpDigits(value: number): PumpDigits {
  const magnitude = String(Math.abs(Math.round(value)));
  const sign = value < 0 ? MINUS_SIGN : '';
  return {
    sign,
    unlit: '0'.repeat(Math.max(0, PUMP_DIGITS - magnitude.length)),
    lit: magnitude,
    spoken: `${sign}${magnitude}`,
  };
}
