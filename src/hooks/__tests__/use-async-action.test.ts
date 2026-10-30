import { act, renderHook } from '@testing-library/react-native';

import { useAsyncAction } from '@/hooks/use-async-action';

describe('useAsyncAction', () => {
  it('is busy while the action runs and clears afterwards', async () => {
    const { result } = await renderHook(() => useAsyncAction());
    let finish!: () => void;
    let running!: Promise<void>;

    await act(async () => {
      running = result.current.run(() => new Promise<void>((resolve) => (finish = resolve)));
    });
    expect(result.current.busy).toBe(true);

    await act(async () => {
      finish();
      await running;
    });
    expect(result.current.busy).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('shows the error message when the action fails', async () => {
    const { result } = await renderHook(() => useAsyncAction());

    await act(() => result.current.run(() => Promise.reject(new Error('No trip found with that code'))));

    expect(result.current.error).toBe('No trip found with that code');
    expect(result.current.busy).toBe(false);
  });

  it('clears the previous error when retrying', async () => {
    const { result } = await renderHook(() => useAsyncAction());
    await act(() => result.current.run(() => Promise.reject(new Error('first'))));

    await act(() => result.current.run(() => Promise.resolve()));

    expect(result.current.error).toBeNull();
  });
});
