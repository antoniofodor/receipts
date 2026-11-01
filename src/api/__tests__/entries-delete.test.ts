import { deleteEntry } from '@/api/entries';
import { callFunction } from '@/api/request';
import { supabase } from '@/api/supabase-client';

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }));
jest.mock('@/api/request', () => ({ callFunction: jest.fn(), unwrap: jest.fn() }));
jest.mock('@/api/supabase-client', () => {
  const remove = jest.fn().mockResolvedValue({ data: [], error: null });
  return { supabase: { storage: { from: jest.fn(() => ({ remove })) } } };
});

const removeFiles = () => jest.mocked(supabase.storage.from).mock.results[0]?.value.remove;

describe('deleteEntry', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deletes the entry, then removes the photo files the database hands back', async () => {
    jest.mocked(callFunction).mockResolvedValue(['trip-1/entry-1/1.jpg', 'trip-1/entry-1/2.jpg']);

    await deleteEntry('entry-1');

    expect(callFunction).toHaveBeenCalledWith('delete_entry', { p_entry_id: 'entry-1' });
    expect(supabase.storage.from).toHaveBeenCalledWith('evidence');
    expect(removeFiles()).toHaveBeenCalledWith(['trip-1/entry-1/1.jpg', 'trip-1/entry-1/2.jpg']);
  });

  it('skips storage for an entry without photos', async () => {
    jest.mocked(callFunction).mockResolvedValue([]);

    await deleteEntry('entry-1');

    expect(supabase.storage.from).not.toHaveBeenCalled();
  });

  it('removes nothing when the database refuses', async () => {
    jest.mocked(callFunction).mockRejectedValue(new Error('Only the person who logged this entry can delete it'));

    await expect(deleteEntry('entry-1')).rejects.toThrow('Only the person who logged');
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });
});
