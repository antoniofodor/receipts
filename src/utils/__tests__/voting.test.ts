import { makeEntry, players, vote } from '@/test-utils/entry-fixture';
import { entriesStillNeedingMyVote, myVotingState, tallyVotes, withMyVote } from '@/utils/voting';

describe('myVotingState', () => {
  it('lets a bystander vote on a pending entry', () => {
    expect(myVotingState(makeEntry(), players.sully.id)).toEqual({ kind: 'can-vote' });
  });

  it('never offers a vote to the person who logged it', () => {
    expect(myVotingState(makeEntry(), players.dev.id)).toEqual({ kind: 'logged-it' });
  });

  it('never offers a vote to the person it is about', () => {
    expect(myVotingState(makeEntry(), players.jonno.id)).toEqual({ kind: 'about-me' });
  });

  it('treats a self-claim as logged by me', () => {
    const selfClaim = makeEntry({ filer: players.jonno, subject: players.jonno });
    expect(myVotingState(selfClaim, players.jonno.id)).toEqual({ kind: 'logged-it' });
  });

  it('remembers how I voted', () => {
    const entry = makeEntry({ votes: [vote('sully', false)] });
    expect(myVotingState(entry, players.sully.id)).toEqual({ kind: 'voted', confirmed: false });
  });

  it('closes voting once the entry is decided', () => {
    expect(myVotingState(makeEntry({ status: 'confirmed' }), players.sully.id)).toEqual({ kind: 'decided' });
    expect(myVotingState(makeEntry({ status: 'rejected' }), players.dev.id)).toEqual({ kind: 'decided' });
  });
});

describe('tallyVotes', () => {
  it('splits voters into confirmed and rejected', () => {
    expect(tallyVotes([vote('sully', true), vote('tommo', false), vote('dev', true)])).toEqual({
      confirmedBy: ['Sully', 'Dev'],
      rejectedBy: ['Tommo'],
    });
  });
});

describe('withMyVote', () => {
  const me = { id: players.sully.id, name: players.sully.name };

  it('adds my vote and leaves the entry pending below the threshold', () => {
    const entry = withMyVote(makeEntry(), me, true, 3);
    expect(entry.status).toBe('pending');
    expect(entry.votes).toEqual([vote('sully', true)]);
  });

  it('confirms the entry when my confirm reaches the threshold, like cast_vote', () => {
    const entry = withMyVote(makeEntry({ votes: [vote('tommo', true), vote('dev', true)] }), me, true, 3);
    expect(entry.status).toBe('confirmed');
  });

  it('rejects the entry when my reject reaches the threshold', () => {
    const entry = withMyVote(makeEntry({ votes: [vote('tommo', false), vote('dev', false)] }), me, false, 3);
    expect(entry.status).toBe('rejected');
  });
});

describe('entriesStillNeedingMyVote', () => {
  it('drops entries I have voted on since the list was fetched', () => {
    const voted = makeEntry({ id: 'voted', votes: [vote('sully', true)] });
    const open = makeEntry({ id: 'open' });
    expect(entriesStillNeedingMyVote([voted, open], players.sully.id).map((entry) => entry.id)).toEqual(['open']);
  });
});
