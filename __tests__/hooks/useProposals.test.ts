import { renderHook, waitFor } from '@testing-library/react-native';
import { useProposals, useRespondToProposal } from '../../hooks/useProposals';
import { supabase } from '../../lib/supabase';
import { createWrapper, mockUser } from '../test-utils';

jest.mock('../../providers/AuthProvider', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockProposal = {
  id: 'proposal-1',
  created_by: 'other-user',
  title: 'Friday tennis',
  activity_tag: 'tennis',
  status: 'open',
  created_at: '2026-02-19T00:00:00Z',
  group_id: null,
  description: null,
  proposed_date: '2026-02-21',
  proposed_time_block: 'morning',
  location_name: null,
  creator: { display_name: 'Alice', avatar_url: null, username: 'alice' },
  group: null,
  responses: [
    { user_id: mockUser.id, response: 'accepted', profile: { display_name: 'Shaham', avatar_url: null, username: 'shaham' } },
  ],
};

describe('useProposals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns proposals from supabase', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [mockProposal], error: null }),
    });

    const { result } = renderHook(() => useProposals(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].title).toBe('Friday tennis');
    // my_response should be set based on user's response
    expect(result.current.data![0].my_response).toBe('accepted');
  });

  it('returns empty array when no proposals', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    const { result } = renderHook(() => useProposals(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });

  it('sets my_response to null when user has no response', async () => {
    const proposalWithoutMyResponse = { ...mockProposal, responses: [] };
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [proposalWithoutMyResponse], error: null }),
    });

    const { result } = renderHook(() => useProposals(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0].my_response).toBeNull();
  });
});

describe('useRespondToProposal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls supabase upsert with correct data', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockReturnValue({
      upsert: mockUpsert,
    });

    const { result } = renderHook(() => useRespondToProposal(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ proposalId: 'proposal-1', response: 'accepted' });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        proposal_id: 'proposal-1',
        user_id: mockUser.id,
        response: 'accepted',
      }),
      expect.any(Object)
    );
  });
});
