import { useState } from 'react';

import { RULE_TITLE_MIN_LENGTH } from '@/constants/game-rules';
import { kindOfPoints, signedPoints, type RuleKind } from '@/utils/points';
import { normaliseRuleTitle } from '@/utils/rule-search';

export type RuleDraft = ReturnType<typeof useRuleDraft>;

// A rule being written or edited, kept as kind and magnitude so the points stepper can't cross zero.
export function useRuleDraft(initial: { title: string; points: number }) {
  const [title, setTitle] = useState(initial.title);
  const [kind, setKind] = useState<RuleKind>(kindOfPoints(initial.points));
  const [magnitude, setMagnitude] = useState(Math.abs(initial.points));
  const rule = { title: normaliseRuleTitle(title), points: signedPoints(kind, magnitude) };

  return {
    title,
    setTitle,
    kind,
    setKind,
    magnitude,
    setMagnitude,
    rule,
    hasTitle: rule.title.length >= RULE_TITLE_MIN_LENGTH,
  };
}
