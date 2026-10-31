import { act, renderHook } from '@testing-library/react-native';

import { useKeptWhileFocused } from '@/hooks/use-kept-while-focused';

jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));

type Item = { id: string; label: string; at: number };

const newestFirst = (a: Item, b: Item) => b.at - a.at;
const item = (id: string, at: number, label = id): Item => ({ id, label, at });

async function renderKept(items: Item[], newerCopies: Item[] = []) {
  return renderHook(
    ({ items: current, newerCopies: copies }: { items: Item[]; newerCopies: Item[] }) =>
      useKeptWhileFocused(current, copies, newestFirst),
    { initialProps: { items, newerCopies } },
  );
}

describe('useKeptWhileFocused', () => {
  it('keeps an item on screen after it leaves the list', async () => {
    const hook = await renderKept([item('a', 2), item('b', 1)]);

    await hook.rerender({ items: [item('b', 1)], newerCopies: [item('a', 2)] });

    expect(hook.result.current.items.map((each) => each.id)).toEqual(['a', 'b']);
  });

  it('shows the newest copy of a kept item', async () => {
    const hook = await renderKept([item('a', 1, 'before')]);

    await hook.rerender({ items: [], newerCopies: [item('a', 1, 'after')] });

    expect(hook.result.current.items).toEqual([item('a', 1, 'after')]);
  });

  it('slots new arrivals into order', async () => {
    const hook = await renderKept([item('a', 1)]);

    await hook.rerender({ items: [item('a', 1), item('new', 5)], newerCopies: [] });

    expect(hook.result.current.items.map((each) => each.id)).toEqual(['new', 'a']);
  });

  it('drops a kept item once it is gone from every list', async () => {
    const hook = await renderKept([item('a', 2), item('b', 1)]);

    await hook.rerender({ items: [item('b', 1)], newerCopies: [item('b', 1)] });

    expect(hook.result.current.items.map((each) => each.id)).toEqual(['b']);
  });

  it('lets go of items that left once released', async () => {
    const hook = await renderKept([item('a', 2), item('b', 1)]);
    await hook.rerender({ items: [item('b', 1)], newerCopies: [item('a', 2)] });

    await act(() => hook.result.current.release());

    expect(hook.result.current.items.map((each) => each.id)).toEqual(['b']);
  });
});
