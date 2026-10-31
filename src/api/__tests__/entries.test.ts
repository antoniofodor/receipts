import { createEntry } from '@/api/entries';
import { callFunction } from '@/api/request';

jest.mock('@/api/request', () => ({ callFunction: jest.fn(), unwrap: jest.fn() }));
jest.mock('@/api/supabase-client', () => ({ supabase: {} }));

const callFunctionMock = jest.mocked(callFunction);

describe('createEntry', () => {
  beforeEach(() => callFunctionMock.mockReset());

  it('sends an existing rule by id', async () => {
    await createEntry({ tripId: 't', subjectId: 'p', rule: { existingRuleId: 'r' }, points: -10, note: ' 20 min late ' });

    expect(callFunctionMock).toHaveBeenCalledWith('create_entry', {
      p_trip_id: 't',
      p_subject_id: 'p',
      p_rule_id: 'r',
      p_points: -10,
      p_note: '20 min late',
    });
  });

  it('sends a new rule by title and points, and no note when blank', async () => {
    await createEntry({
      tripId: 't',
      subjectId: 'p',
      rule: { newRuleTitle: 'Ordering pineapple on pizza', newRulePoints: -10 },
      points: -10,
      note: '   ',
    });

    expect(callFunctionMock).toHaveBeenCalledWith('create_entry', {
      p_trip_id: 't',
      p_subject_id: 'p',
      p_new_rule_title: 'Ordering pineapple on pizza',
      p_new_rule_points: -10,
      p_points: -10,
      p_note: null,
    });
  });
});
