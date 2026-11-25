import { useState } from 'react';

import type { NewPackRule } from '@/api/custom-packs';
import { comparableRuleTitle } from '@/utils/rule-search';

const keyOf = (rule: NewPackRule) => comparableRuleTitle(rule.title);

// Rules ticked off from wherever they come from, one per name, ready to add to a pack together.
export function useRuleSelection() {
  const [picked, setPicked] = useState<Map<string, NewPackRule>>(new Map());

  function toggle(rule: NewPackRule) {
    setPicked((current) => {
      const next = new Map(current);
      if (next.has(keyOf(rule))) next.delete(keyOf(rule));
      else next.set(keyOf(rule), { title: rule.title, points: rule.points });
      return next;
    });
  }

  function pickAll(rules: NewPackRule[]) {
    setPicked((current) => {
      const next = new Map(current);
      for (const rule of rules) next.set(keyOf(rule), { title: rule.title, points: rule.points });
      return next;
    });
  }

  return {
    rules: [...picked.values()],
    isPicked: (rule: NewPackRule) => picked.has(keyOf(rule)),
    toggle,
    pickAll,
    clear: () => setPicked(new Map()),
  };
}

export type RuleSelection = ReturnType<typeof useRuleSelection>;
