import { avatarUrl } from '@/api/avatar-url';
import { removeMyPhoto, setMyPhoto } from '@/api/avatars';
import { callFunction } from '@/api/request';
import { supabase } from '@/api/supabase-client';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'new-photo' }));
jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation(() => ({ arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4)) })),
}));
jest.mock('@/api/request', () => ({ callFunction: jest.fn(), toUserMessage: (message: string) => message }));
jest.mock('@/api/supabase-client', () => {
  const bucket = {
    upload: jest.fn().mockResolvedValue({ error: null }),
    remove: jest.fn().mockResolvedValue({ data: [], error: null }),
  };
  return { supabase: { storage: { from: jest.fn(() => bucket) } } };
});

const bucket = () => jest.mocked(supabase.storage.from)('avatars');
const photo = { uri: 'file:///me.jpg', width: 512, height: 512 };

describe('profile photos', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uploads into my own folder under a new name, then removes the photo it replaced', async () => {
    jest.mocked(callFunction).mockResolvedValue('trip-1/sully/old.jpg');

    const path = await setMyPhoto('trip-1', 'sully', photo);

    expect(path).toBe('trip-1/sully/new-photo.jpg');
    expect(bucket().upload).toHaveBeenCalledWith(path, expect.any(ArrayBuffer), { contentType: 'image/jpeg' });
    expect(callFunction).toHaveBeenCalledWith('set_my_photo', { p_trip_id: 'trip-1', p_photo_path: path });
    expect(bucket().remove).toHaveBeenCalledWith(['trip-1/sully/old.jpg']);
  });

  it("doesn't tell the database about a photo that failed to upload", async () => {
    jest.mocked(bucket().upload).mockResolvedValueOnce({ data: null, error: new Error('Payload too large') } as never);

    await expect(setMyPhoto('trip-1', 'sully', photo)).rejects.toThrow('Payload too large');
    expect(callFunction).not.toHaveBeenCalled();
  });

  it('clears my photo and removes the file', async () => {
    jest.mocked(callFunction).mockResolvedValue('trip-1/sully/old.jpg');

    await removeMyPhoto('trip-1');

    expect(callFunction).toHaveBeenCalledWith('set_my_photo', { p_trip_id: 'trip-1', p_photo_path: null });
    expect(bucket().remove).toHaveBeenCalledWith(['trip-1/sully/old.jpg']);
  });

  it('builds public links without a request', () => {
    expect(avatarUrl('trip-1/sully/a b.jpg')).toMatch(
      /\/storage\/v1\/object\/public\/avatars\/trip-1\/sully\/a%20b\.jpg$/,
    );
  });
});
