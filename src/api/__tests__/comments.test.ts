import { addComment } from '@/api/comments';
import { callFunction } from '@/api/request';

jest.mock('@/api/request', () => ({ callFunction: jest.fn(), unwrap: jest.fn() }));
jest.mock('@/api/supabase-client', () => ({ supabase: {} }));

describe('addComment', () => {
  it('sends the trimmed text and the thread it belongs to', async () => {
    await addComment('entry-1', '  guilty  ', 'parent-1');

    expect(callFunction).toHaveBeenCalledWith('add_comment', {
      p_entry_id: 'entry-1',
      p_body: 'guilty',
      p_parent_id: 'parent-1',
    });
  });
});
