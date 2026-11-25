import { canManageRule } from '@/utils/rule-permissions';

describe('canManageRule', () => {
  const player = { player_id: 'jonno', is_organiser: false };
  const organiser = { player_id: 'dev', is_organiser: true };

  it('lets whoever added a rule change it', () => {
    expect(canManageRule({ created_by: 'jonno' }, player)).toBe(true);
  });

  it("doesn't let other players change it", () => {
    expect(canManageRule({ created_by: 'kev' }, player)).toBe(false);
  });

  it('leaves pack rules, which nobody added, to the organiser', () => {
    expect(canManageRule({ created_by: null }, player)).toBe(false);
    expect(canManageRule({ created_by: null }, organiser)).toBe(true);
  });

  it('lets the organiser change anyone’s rule', () => {
    expect(canManageRule({ created_by: 'kev' }, organiser)).toBe(true);
  });
});
