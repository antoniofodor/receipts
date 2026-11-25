import type { RulePack } from '@/api/rule-packs';
import {
  canManageRulePacks,
  defaultRulePackIds,
  rulesFromPack,
  rulesMissingFromTrip,
  toggled,
} from '@/utils/rule-packs';

const pack = (id: string, titles: string[]): RulePack => ({
  id,
  name: id,
  rules: titles.map((title) => ({ title, points: -5 })),
});

describe('rulesMissingFromTrip', () => {
  it('skips rules the trip already has, ignoring case and extra spaces like the database', () => {
    const cabin = pack('cabin', ['Spilling a drink', 'Throwing up', 'Last to arrive']);
    const missing = rulesMissingFromTrip(cabin, [{ title: 'SPILLING  a drink ' }, { title: 'Something else' }]);
    expect(missing.map((rule) => rule.title)).toEqual(['Throwing up', 'Last to arrive']);
  });

  it('finds nothing missing once the pack is in', () => {
    const cabin = pack('cabin', ['Throwing up']);
    expect(rulesMissingFromTrip(cabin, [{ title: 'Throwing up' }])).toEqual([]);
  });
});

describe('defaultRulePackIds', () => {
  it('picks the first pack in the catalog', () => {
    expect(defaultRulePackIds([pack('classics', []), pack('cabin', [])])).toEqual(['classics']);
  });

  it('picks nothing from an empty catalog', () => {
    expect(defaultRulePackIds([])).toEqual([]);
  });
});

describe('canManageRulePacks', () => {
  it('is the organiser only', () => {
    expect(canManageRulePacks({ is_organiser: true })).toBe(true);
    expect(canManageRulePacks({ is_organiser: false })).toBe(false);
  });
});

describe('rulesFromPack', () => {
  it("finds the rules copied from the pack, whatever they were renamed to, and not the trip's own", () => {
    const tripRules = [
      { id: 'a', pack_id: 'cabin-weekend', custom_pack_id: null },
      { id: 'b', pack_id: 'classics', custom_pack_id: null },
      { id: 'c', pack_id: null, custom_pack_id: null },
      { id: 'd', pack_id: 'cabin-weekend', custom_pack_id: null },
      { id: 'e', pack_id: null, custom_pack_id: 'mine' },
    ];
    expect(rulesFromPack({ kind: 'preset', id: 'cabin-weekend' }, tripRules).map((rule) => rule.id)).toEqual([
      'a',
      'd',
    ]);
    expect(rulesFromPack({ kind: 'custom', id: 'mine' }, tripRules).map((rule) => rule.id)).toEqual(['e']);
  });
});

describe('toggled', () => {
  it('adds a missing id at the end and removes a present one', () => {
    expect(toggled(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggled(['a', 'b'], 'a')).toEqual(['b']);
  });
});
