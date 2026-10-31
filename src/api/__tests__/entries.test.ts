import { createEntry } from '@/api/entries';
import { uploadEntryPhoto } from '@/api/photos';
import { callFunction } from '@/api/request';

jest.mock('@/api/request', () => ({ callFunction: jest.fn(), unwrap: jest.fn() }));
jest.mock('@/api/supabase-client', () => ({ supabase: {} }));
jest.mock('@/api/photos', () => ({ uploadEntryPhoto: jest.fn() }));
jest.mock('expo-crypto', () => ({ randomUUID: () => 'entry-id' }));

const callFunctionMock = jest.mocked(callFunction);
const uploadMock = jest.mocked(uploadEntryPhoto);

const photo = (name: string) => ({ uri: `file:///${name}.jpg`, width: 1600, height: 1200 });

describe('createEntry', () => {
  beforeEach(() => {
    callFunctionMock.mockReset();
    uploadMock.mockReset();
    uploadMock.mockImplementation(async (tripId, entryId, local, fileName) => ({
      path: `${tripId}/${entryId}/${fileName}.jpg`,
      width: local.width,
      height: local.height,
    }));
  });

  it('sends an existing rule by id', async () => {
    await createEntry({
      tripId: 't',
      subjectId: 'p',
      rule: { existingRuleId: 'r' },
      points: -10,
      note: ' 20 min late ',
      photos: [],
    });

    expect(callFunctionMock).toHaveBeenCalledWith('create_entry', {
      p_trip_id: 't',
      p_subject_id: 'p',
      p_rule_id: 'r',
      p_points: -10,
      p_note: '20 min late',
      p_entry_id: 'entry-id',
      p_photos: [],
    });
  });

  it('sends a new rule by title and points, and no note when blank', async () => {
    await createEntry({
      tripId: 't',
      subjectId: 'p',
      rule: { newRuleTitle: 'Ordering pineapple on pizza', newRulePoints: -10 },
      points: -10,
      note: '   ',
      photos: [],
    });

    expect(callFunctionMock).toHaveBeenCalledWith(
      'create_entry',
      expect.objectContaining({
        p_new_rule_title: 'Ordering pineapple on pizza',
        p_new_rule_points: -10,
        p_note: null,
      }),
    );
  });

  it("uploads photos into the new entry's folder before saving the entry with them", async () => {
    await createEntry({
      tripId: 't',
      subjectId: 'p',
      rule: { existingRuleId: 'r' },
      points: -5,
      note: '',
      photos: [photo('a'), photo('b')],
    });

    expect(uploadMock).toHaveBeenCalledWith('t', 'entry-id', photo('a'), '1');
    expect(uploadMock).toHaveBeenCalledWith('t', 'entry-id', photo('b'), '2');
    expect(callFunctionMock).toHaveBeenCalledWith(
      'create_entry',
      expect.objectContaining({
        p_entry_id: 'entry-id',
        p_photos: [
          { path: 't/entry-id/1.jpg', width: 1600, height: 1200 },
          { path: 't/entry-id/2.jpg', width: 1600, height: 1200 },
        ],
      }),
    );
  });

  it('saves nothing if a photo fails to upload', async () => {
    uploadMock.mockRejectedValueOnce(new Error('No connection. Check your signal and try again.'));

    await expect(
      createEntry({
        tripId: 't',
        subjectId: 'p',
        rule: { existingRuleId: 'r' },
        points: -5,
        note: '',
        photos: [photo('a')],
      }),
    ).rejects.toThrow('No connection');
    expect(callFunctionMock).not.toHaveBeenCalled();
  });
});
