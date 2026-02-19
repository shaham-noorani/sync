import { renderHook, waitFor } from '@testing-library/react-native';
import { useFeed, useToggleReaction } from '../../hooks/useHangouts';
import { supabase } from '../../lib/supabase';
import { createWrapper, mockUser } from '../test-utils';

jest.mock('../../providers/AuthProvider', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockHangout = {
  id: 'hangout-1',
  title: 'Tennis Saturday',
  activity_tag: 'tennis',
  date: '2026-02-22',
  created_by: mockUser.id,
  created_at: '2026-02-19T10:00:00Z',
  group_id: null,
  proposal_id: null,
  location_name: 'Tennis Club',
  location_city: null,
  creator: { display_name: 'Shaham', avatar_url: null, username: 'shaham' },
  attendees: [{ user_id: mockUser.id, profile: { display_name: 'Shaham', avatar_url: null } }],
  photos: [],
  reactions: [{ user_id: mockUser.id, emoji: '🔥' }],
};

describe('useFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns hangouts from supabase', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [mockHangout], error: null }),
    });

    const { result } = renderHook(() => useFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].title).toBe('Tennis Saturday');
  });

  it('extracts my_reaction from reactions array', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [mockHangout], error: null }),
    });

    const { result } = renderHook(() => useFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0].my_reaction).toBe('🔥');
  });

  it('sets my_reaction to null when user has not reacted', async () => {
    const hangoutNoReaction = { ...mockHangout, reactions: [] };
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [hangoutNoReaction], error: null }),
    });

    const { result } = renderHook(() => useFeed(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0].my_reaction).toBeNull();
  });
});

describe('useToggleReaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts new reaction when none exists', async () => {
    const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null });
    const mockInsert = jest.fn().mockResolvedValue({ error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle,
      insert: mockInsert,
    });

    const { result } = renderHook(() => useToggleReaction(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ hangoutId: 'hangout-1', emoji: '❤️' });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ hangout_id: 'hangout-1', user_id: mockUser.id, emoji: '❤️' })
    );
  });

  it('deletes reaction when same emoji is toggled off', async () => {
    const existingReaction = { id: 'reaction-1', emoji: '❤️' };
    const mockMaybeSingle = jest.fn().mockResolvedValue({ data: existingReaction });
    const mockDelete = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({ error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle,
      delete: mockDelete,
    });
    mockDelete.mockReturnValue({ eq: mockEq });

    const { result } = renderHook(() => useToggleReaction(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ hangoutId: 'hangout-1', emoji: '❤️' });

    expect(mockDelete).toHaveBeenCalled();
  });
});
