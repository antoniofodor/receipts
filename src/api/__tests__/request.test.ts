import { toUserMessage, unwrap } from '@/api/request';

describe('toUserMessage', () => {
  it.each(['TypeError: Network request failed', 'Failed to fetch', 'fetch failed'])(
    'rewords network failures (%s)',
    (raw) => {
      expect(toUserMessage(raw)).toBe('No connection. Check your signal and try again.');
    },
  );

  it('passes database messages through unchanged', () => {
    expect(toUserMessage('No trip found with that code')).toBe('No trip found with that code');
  });
});

describe('unwrap', () => {
  it('returns data when there is no error', () => {
    expect(unwrap({ data: [1, 2], error: null })).toEqual([1, 2]);
  });

  it('throws the user-facing message on error', () => {
    expect(() => unwrap({ data: null, error: { message: 'Voting on this entry has closed' } })).toThrow(
      'Voting on this entry has closed',
    );
  });
});
