import { RULE_POINTS_LIMIT } from '@/constants/game-rules';

export type RuleKind = 'penalty' | 'bonus';

export const kindOfPoints = (points: number): RuleKind => (points < 0 ? 'penalty' : 'bonus');

export function signedPoints(kind: RuleKind, magnitude: number) {
  return kind === 'penalty' ? -Math.abs(magnitude) : Math.abs(magnitude);
}

export const rulePointsRange = { min: 1, max: RULE_POINTS_LIMIT };
