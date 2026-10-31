import type { RuleSummary } from '@/hooks/use-log-entry-form';

export type LogRouteParams = { ruleId?: string; ruleTitle?: string; rulePoints?: string };

export function logHrefWithRule(rule: RuleSummary) {
  const params: LogRouteParams = { ruleId: rule.id, ruleTitle: rule.title, rulePoints: String(rule.points) };
  return { pathname: '/log' as const, params };
}

export function ruleFromLogParams({ ruleId, ruleTitle, rulePoints }: LogRouteParams): RuleSummary | null {
  const points = Number(rulePoints);
  if (!ruleId || !ruleTitle || !Number.isInteger(points) || points === 0) return null;
  return { id: ruleId, title: ruleTitle, points };
}
