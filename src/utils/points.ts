import { ENTRY_POINTS_LIMIT, RULE_POINTS_LIMIT } from '@/constants/game-rules';

export type RuleKind = 'penalty' | 'bonus';

export const kindOfPoints = (points: number): RuleKind => (points < 0 ? 'penalty' : 'bonus');

export function signedPoints(kind: RuleKind, magnitude: number) {
  return kind === 'penalty' ? -Math.abs(magnitude) : Math.abs(magnitude);
}

// An entry keeps its rule's sign, so a penalty can be made bigger but never turned into a bonus.
export function entryPointsRange(rulePoints: number) {
  return rulePoints < 0 ? { min: -ENTRY_POINTS_LIMIT, max: -1 } : { min: 1, max: ENTRY_POINTS_LIMIT };
}

export const rulePointsRange = { min: 1, max: RULE_POINTS_LIMIT };
