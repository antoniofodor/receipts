import { rulesMissingFromPack, packHasRuleNamed } from '@/utils/custom-packs';
import { looksLikeEmail, normaliseEmail } from '@/utils/email';
import { accountPurposeFrom } from '@/utils/account';

const pack = { rules: [{ title: 'Drinking from a straw', points: -5 }] };

describe('rulesMissingFromPack', () => {
  it('skips names the pack has, whatever their case, and repeats within the list', () => {
    const picked = [
      { title: 'drinking from a straw', points: -10 },
      { title: 'Best speech', points: 15 },
      { title: 'BEST SPEECH', points: 5 },
    ];
    expect(rulesMissingFromPack(pack, picked)).toEqual([{ title: 'Best speech', points: 15 }]);
  });

  it('knows which names the pack already has', () => {
    expect(packHasRuleNamed(pack, '  DRINKING from a straw ')).toBe(true);
    expect(packHasRuleNamed(pack, 'Best speech')).toBe(false);
  });
});

describe('email', () => {
  it('trims and lowercases, and catches an obvious typo before a code is sent', () => {
    expect(normaliseEmail('  Sam@Example.COM ')).toBe('sam@example.com');
    expect(looksLikeEmail('sam@example.com')).toBe(true);
    expect(looksLikeEmail('sam@example')).toBe(false);
    expect(looksLikeEmail('sam example.com')).toBe(false);
  });
});

describe('accountPurposeFrom', () => {
  it('creates an account unless asked to sign in', () => {
    expect(accountPurposeFrom('sign-in')).toBe('sign-in');
    expect(accountPurposeFrom(undefined)).toBe('create');
    expect(accountPurposeFrom('anything')).toBe('create');
  });
});
