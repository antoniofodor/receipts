import { normalisePlayerName, playerNameProblem, withPlayerRenamed } from '@/utils/player-name';

const players = [
  { id: 'sully', name: 'Sully' },
  { id: 'jonno', name: 'Jonno' },
];

describe('normalisePlayerName', () => {
  it('trims and squeezes runs of spaces, as the database does', () => {
    expect(normalisePlayerName('  Big \t  Sully ')).toBe('Big Sully');
  });
});

describe('playerNameProblem', () => {
  it('accepts a fresh name, and my own name in a different case', () => {
    expect(playerNameProblem('  Big   Sully ', players, 'sully')).toBeNull();
    expect(playerNameProblem('SULLY', players, 'sully')).toBeNull();
  });

  it('refuses an empty name and one over 30 characters', () => {
    expect(playerNameProblem('   ', players, 'sully')).toBe('Names must be 1 to 30 characters');
    expect(playerNameProblem('x'.repeat(31), players, 'sully')).toBe('Names must be 1 to 30 characters');
    expect(playerNameProblem('x'.repeat(30), players, 'sully')).toBeNull();
  });

  it('counts an emoji as one character, as Postgres does', () => {
    expect(playerNameProblem('🍺'.repeat(30), players, 'sully')).toBeNull();
  });

  it("refuses someone else's name, whatever its case", () => {
    expect(playerNameProblem(' jONNO ', players, 'sully')).toBe('Someone in this trip is already called "jONNO"');
  });
});

describe('withPlayerRenamed', () => {
  it('renames only that player', () => {
    expect(withPlayerRenamed(players, (player) => player.id, 'sully', 'Big Sully')).toEqual([
      { id: 'sully', name: 'Big Sully' },
      { id: 'jonno', name: 'Jonno' },
    ]);
  });
});
