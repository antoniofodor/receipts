import { describeFailedJoin } from '@/components/join/describe-failed-join';

describe('describeFailedJoin', () => {
  it('counts down remaining PIN attempts', () => {
    expect(describeFailedJoin({ ok: false, error: 'wrong_pin', attempts_left: 3 }, 'Jonno')).toBe(
      'Wrong PIN. 3 tries left.',
    );
    expect(describeFailedJoin({ ok: false, error: 'wrong_pin', attempts_left: 1 }, 'Jonno')).toBe(
      'Wrong PIN. 1 try left.',
    );
  });

  it('explains a lockout in whole minutes and who to ask', () => {
    const message = describeFailedJoin({ ok: false, error: 'locked', retry_after_seconds: 590 }, 'Jonno');
    expect(message).toContain('Jonno is locked for 10 min');
    expect(message).toContain('Ask the organiser');
  });
});
