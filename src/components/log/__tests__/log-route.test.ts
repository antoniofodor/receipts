import { logHrefWithRule, ruleFromLogParams } from '@/components/log/log-route';

describe('log route params', () => {
  it('round-trips a rule through the link', () => {
    const rule = { id: 'r1', title: 'Drinking from a straw', points: -5 };
    expect(ruleFromLogParams(logHrefWithRule(rule).params)).toEqual(rule);
  });

  it('ignores missing or malformed params', () => {
    expect(ruleFromLogParams({})).toBeNull();
    expect(ruleFromLogParams({ ruleId: 'r1', ruleTitle: 'Straw', rulePoints: 'abc' })).toBeNull();
    expect(ruleFromLogParams({ ruleId: 'r1', ruleTitle: 'Straw', rulePoints: '0' })).toBeNull();
  });
});
