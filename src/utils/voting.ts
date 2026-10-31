import type { Entry, Vote } from '@/api/entries';

export type MyVotingState =
  | { kind: 'decided' }
  | { kind: 'logged-it' }
  | { kind: 'about-me' }
  | { kind: 'voted'; confirmed: boolean }
  | { kind: 'can-vote' };

// Same order the database checks in cast_vote, so the app never offers a vote it would refuse.
export function myVotingState(entry: Entry, myPlayerId: string): MyVotingState {
  if (entry.status !== 'pending') return { kind: 'decided' };
  if (entry.filer.id === myPlayerId) return { kind: 'logged-it' };
  if (entry.subject.id === myPlayerId) return { kind: 'about-me' };
  const myVote = entry.votes.find((vote) => vote.voter.id === myPlayerId);
  if (myVote) return { kind: 'voted', confirmed: myVote.confirm };
  return { kind: 'can-vote' };
}

export function tallyVotes(votes: Vote[]) {
  return {
    confirmedBy: votes.filter((vote) => vote.confirm).map((vote) => vote.voter.name),
    rejectedBy: votes.filter((vote) => !vote.confirm).map((vote) => vote.voter.name),
  };
}

// Mirrors the threshold check at the end of cast_vote, so the screen can show the result before the server answers.
export function withMyVote(entry: Entry, me: Vote['voter'], confirm: boolean, threshold: number): Entry {
  const votes = [...entry.votes, { confirm, voter: me }];
  const matchingVotes = votes.filter((vote) => vote.confirm === confirm).length;
  if (matchingVotes < threshold) return { ...entry, votes };
  return { ...entry, votes, status: confirm ? 'confirmed' : 'rejected' };
}

export function entriesStillNeedingMyVote(entries: Entry[], myPlayerId: string) {
  return entries.filter((entry) => myVotingState(entry, myPlayerId).kind === 'can-vote');
}
