import { renderHook } from '@testing-library/react-native';

import type { EntryStatus } from '@/api/entries';
import { useSettledWhileWatching } from '@/hooks/use-settled-while-watching';

function renderStatus(initial: EntryStatus) {
  return renderHook(({ status }: { status: EntryStatus }) => useSettledWhileWatching(status), {
    initialProps: { status: initial },
  });
}

describe('useSettledWhileWatching', () => {
  it('reports nothing for an entry that was already settled when it appeared', async () => {
    const { result } = await renderStatus('confirmed');

    expect(result.current).toBeNull();
  });

  it('reports the result when a pending entry is approved or declined on screen', async () => {
    const approved = await renderStatus('pending');
    await approved.rerender({ status: 'confirmed' });
    expect(approved.result.current).toBe('confirmed');

    const declined = await renderStatus('pending');
    await declined.rerender({ status: 'rejected' });
    expect(declined.result.current).toBe('rejected');
  });

  it('takes the stamp back if the server undoes the result', async () => {
    const { result, rerender } = await renderStatus('pending');
    await rerender({ status: 'confirmed' });
    await rerender({ status: 'pending' });

    expect(result.current).toBeNull();
  });
});
