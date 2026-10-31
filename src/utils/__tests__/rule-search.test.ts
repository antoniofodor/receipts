import type { Rule } from '@/api/rules';
import { canCreateRuleNamed, normaliseRuleTitle, rulesOfKind, searchRules } from '@/utils/rule-search';

const rule = (title: string, points = -5): Rule => ({
  id: title,
  title,
  points,
  is_preset: true,
  created_by: null,
  created_at: '2026-10-30T00:00:00Z',
});

const rules = [
  rule('Leaving a drink unfinished'),
  rule('Drinking from a straw'),
  rule('Karaoke performance, full song', 10),
];

describe('searchRules', () => {
  it('returns every rule for an empty query', () => {
    expect(searchRules(rules, '  ')).toHaveLength(3);
  });

  it('matches anywhere in the title, ignoring case', () => {
    expect(searchRules(rules, 'KARAOKE').map((r) => r.title)).toEqual(['Karaoke performance, full song']);
  });

  it('ranks titles that start with the query first', () => {
    expect(searchRules(rules, 'drink').map((r) => r.title)).toEqual([
      'Drinking from a straw',
      'Leaving a drink unfinished',
    ]);
  });
});

describe('canCreateRuleNamed', () => {
  it('allows a new, valid name', () => {
    expect(canCreateRuleNamed(rules, 'Ordering pineapple on pizza')).toBe(true);
  });

  it('refuses a name that already exists, ignoring case and spacing, like the database does', () => {
    expect(canCreateRuleNamed(rules, '  drinking   FROM a straw ')).toBe(false);
  });

  it('refuses names that are too short or too long', () => {
    expect(canCreateRuleNamed(rules, 'x')).toBe(false);
    expect(canCreateRuleNamed(rules, 'x'.repeat(61))).toBe(false);
  });
});

describe('normaliseRuleTitle', () => {
  it('trims and collapses whitespace', () => {
    expect(normaliseRuleTitle('  Ordering   pineapple \n on pizza ')).toBe('Ordering pineapple on pizza');
  });
});

describe('rulesOfKind', () => {
  const mixed = [
    rule('Small fine', -2),
    rule('Big fine', -20),
    rule('Small win', 5),
    rule('Big win', 15),
    rule('Also big win', 15),
  ];

  it('keeps one kind, biggest first, then by name', () => {
    expect(rulesOfKind(mixed, 'penalty').map((r) => r.title)).toEqual(['Big fine', 'Small fine']);
    expect(rulesOfKind(mixed, 'bonus').map((r) => r.title)).toEqual(['Also big win', 'Big win', 'Small win']);
  });
});
