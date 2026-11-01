import { makeEntry, players } from '@/test-utils/entry-fixture';
import { shareCaption } from '@/utils/share-caption';

describe('shareCaption', () => {
  it('says who it is about, what for, the points and where it stands, then who logged it', () => {
    expect(shareCaption(makeEntry({ status: 'confirmed' }), 'Lisbon')).toBe(
      'Jonno: Drinking from a straw (−5) · Approved\nLogged by Dev on Lisbon. Sent from Receipts.',
    );
  });

  it('calls a self-claim a claim', () => {
    expect(shareCaption(makeEntry({ filer: players.jonno }), 'Lisbon')).toBe(
      'Jonno: Drinking from a straw (−5) · Pending\nClaimed by Jonno on Lisbon. Sent from Receipts.',
    );
  });
});
