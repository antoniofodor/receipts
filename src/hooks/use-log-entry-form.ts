import { useState } from 'react';

import type { NewEntry } from '@/api/entries';
import type { Rule } from '@/api/rules';
import { DEFAULT_NEW_RULE_MAGNITUDE } from '@/constants/game-rules';
import { entryPointsRange, kindOfPoints, signedPoints, type RuleKind } from '@/utils/points';

export type RuleSummary = Pick<Rule, 'id' | 'title' | 'points'>;

export type RuleSelection =
  | { type: 'none' }
  | { type: 'existing'; rule: RuleSummary }
  | { type: 'new'; title: string; kind: RuleKind; magnitude: number };

function rulePointsOf(selection: RuleSelection) {
  if (selection.type === 'existing') return selection.rule.points;
  if (selection.type === 'new') return signedPoints(selection.kind, selection.magnitude);
  return null;
}

export function useLogEntryForm(initialRule: RuleSummary | null = null) {
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [ruleKind, setRuleKind] = useState<RuleKind | null>(initialRule ? kindOfPoints(initialRule.points) : null);
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState<RuleSelection>(
    initialRule ? { type: 'existing', rule: initialRule } : { type: 'none' },
  );
  const [pointsOverride, setPointsOverride] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const rulePoints = rulePointsOf(selection);
  const points = pointsOverride ?? rulePoints;
  const pointsRange = rulePoints === null ? null : entryPointsRange(rulePoints);
  const isComplete = subjectId !== null && points !== null;

  function changeSelection(next: RuleSelection) {
    setSelection(next);
    setPointsOverride(null);
  }

  function updateNewRule(changes: Partial<{ kind: RuleKind; magnitude: number }>) {
    if (selection.type === 'new') changeSelection({ ...selection, ...changes });
  }

  function toNewEntry(tripId: string): NewEntry {
    if (subjectId === null || points === null || selection.type === 'none') {
      throw new Error('Pick who it is for and a rule first');
    }
    return {
      tripId,
      subjectId,
      rule:
        selection.type === 'existing'
          ? { existingRuleId: selection.rule.id }
          : { newRuleTitle: selection.title, newRulePoints: signedPoints(selection.kind, selection.magnitude) },
      points,
      note,
    };
  }

  return {
    subjectId,
    ruleKind,
    query,
    selection,
    points,
    pointsRange,
    note,
    isComplete,
    selectSubject: setSubjectId,
    setRuleKind,
    setQuery,
    pickRule: (rule: RuleSummary) => {
      changeSelection({ type: 'existing', rule });
      setQuery('');
    },
    startNewRule: (title: string) =>
      changeSelection({ type: 'new', title, kind: ruleKind ?? 'penalty', magnitude: DEFAULT_NEW_RULE_MAGNITUDE }),
    setNewRuleKind: (kind: RuleKind) => {
      setRuleKind(kind);
      updateNewRule({ kind });
    },
    setNewRuleMagnitude: (magnitude: number) => updateNewRule({ magnitude }),
    clearRule: () => changeSelection({ type: 'none' }),
    setPoints: setPointsOverride,
    setNote,
    toNewEntry,
  };
}
