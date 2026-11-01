import { act, renderHook } from '@testing-library/react-native';

import { useLogEntryForm } from '@/hooks/use-log-entry-form';

const straw = { id: 'straw', title: 'Drinking from a straw', points: -5 };
const karaoke = { id: 'karaoke', title: 'Karaoke performance, full song', points: 10 };

describe('useLogEntryForm', () => {
  it('is incomplete until both a player and a rule are chosen', async () => {
    const { result } = await renderHook(() => useLogEntryForm());
    expect(result.current.isComplete).toBe(false);

    await act(async () => result.current.selectSubject('jonno'));
    expect(result.current.isComplete).toBe(false);

    await act(async () => result.current.pickRule(straw));
    expect(result.current.isComplete).toBe(true);
    expect(result.current.points).toBe(-5);
  });

  it('starts with a rule passed in from the rulebook, and its kind selected', async () => {
    const { result } = await renderHook(() => useLogEntryForm(karaoke));
    expect(result.current.selection).toEqual({ type: 'existing', rule: karaoke });
    expect(result.current.ruleKind).toBe('bonus');
  });

  it('creates a new rule as the kind currently picked', async () => {
    const { result } = await renderHook(() => useLogEntryForm());
    await act(async () => result.current.setRuleKind('bonus'));
    await act(async () => result.current.startNewRule('Carried the groom home'));
    expect(result.current.points).toBe(5);
  });

  it("always counts the chosen rule's points, with nothing to adjust per entry", async () => {
    const { result } = await renderHook(() => useLogEntryForm(straw));
    expect(result.current.points).toBe(-5);

    await act(async () => result.current.pickRule(karaoke));

    expect(result.current.points).toBe(10);
    expect(result.current).not.toHaveProperty('setPoints');
  });

  it('creates a new rule as a penalty of 5 by default, and follows kind and size changes', async () => {
    const { result } = await renderHook(() => useLogEntryForm());
    await act(async () => result.current.startNewRule('Ordering pineapple on pizza'));
    expect(result.current.points).toBe(-5);

    await act(async () => result.current.setNewRuleKind('bonus'));
    await act(async () => result.current.setNewRuleMagnitude(8));

    expect(result.current.points).toBe(8);
    expect(result.current.ruleKind).toBe('bonus');
  });

  it('builds the entry for a new rule', async () => {
    const { result } = await renderHook(() => useLogEntryForm());
    await act(async () => result.current.selectSubject('dev'));
    await act(async () => result.current.startNewRule('Ordering pineapple on pizza'));
    await act(async () => result.current.setNewRuleMagnitude(10));
    await act(async () => result.current.setNote('Twice'));

    expect(result.current.toNewEntry('trip')).toEqual({
      tripId: 'trip',
      subjectId: 'dev',
      rule: { newRuleTitle: 'Ordering pineapple on pizza', newRulePoints: -10 },
      note: 'Twice',
      photos: [],
    });
  });

  it('holds up to 3 photos and sends them with the entry', async () => {
    const photo = (name: string) => ({ uri: `file:///${name}.jpg`, width: 1600, height: 1200 });
    const { result } = await renderHook(() => useLogEntryForm());
    await act(async () => result.current.selectSubject('dev'));
    await act(async () => result.current.pickRule(straw));

    await act(async () => result.current.addPhotos([photo('a'), photo('b')]));
    await act(async () => result.current.addPhotos([photo('c'), photo('d')]));
    expect(result.current.photos.map((each) => each.uri)).toEqual(['file:///a.jpg', 'file:///b.jpg', 'file:///c.jpg']);
    expect(result.current.photosLeft).toBe(0);

    await act(async () => result.current.removePhoto('file:///b.jpg'));
    expect(result.current.toNewEntry('trip').photos.map((each) => each.uri)).toEqual([
      'file:///a.jpg',
      'file:///c.jpg',
    ]);
    expect(result.current.photosLeft).toBe(1);
  });

  it('refuses to build an incomplete entry', async () => {
    const { result } = await renderHook(() => useLogEntryForm());
    expect(() => result.current.toNewEntry('trip')).toThrow('Pick who it is for and a rule first');
  });
});
