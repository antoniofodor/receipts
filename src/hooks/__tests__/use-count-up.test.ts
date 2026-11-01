import { act, renderHook } from '@testing-library/react-native';

import { useCountUp } from '@/hooks/use-count-up';

describe('useCountUp', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows the first value straight away', async () => {
    const { result } = await renderHook(() => useCountUp(45));

    expect(result.current).toBe(45);
  });

  it('counts to a new value instead of jumping, and lands exactly on it', async () => {
    const { result, rerender } = await renderHook(({ points }: { points: number }) => useCountUp(points), {
      initialProps: { points: 25 },
    });

    await rerender({ points: 10 });
    await act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBeLessThan(25);
    expect(result.current).toBeGreaterThan(10);

    await act(() => jest.advanceTimersByTime(1000));
    expect(result.current).toBe(10);
  });
});
