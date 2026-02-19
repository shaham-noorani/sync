import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import ProposalsScreen from '../../app/(tabs)/propose';
import CreateProposalScreen from '../../app/proposal/create';
import { renderWithProviders } from '../test-utils';

const mockProposal = {
  id: 'p1',
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
  responses: [{ user_id: 'other-user', response: 'accepted', profile: { display_name: 'Alice', avatar_url: null, username: 'alice' } }],
  my_response: null,
};

jest.mock('../../hooks/useProposals', () => ({
  useProposals: () => ({ data: [mockProposal], isLoading: false, refetch: jest.fn() }),
  useProposalsRealtime: () => {},
  useCreateProposal: () => ({
    mutateAsync: jest.fn().mockResolvedValue({ id: 'new-proposal-id' }),
    isPending: false,
  }),
}));

jest.mock('../../hooks/useFriends', () => ({
  useFriendsList: () => ({
    data: [
      { id: 'friend-1', display_name: 'Alice', username: 'alice', avatar_url: null },
    ],
    isLoading: false,
  }),
}));

jest.mock('../../hooks/useGroups', () => ({
  useMyGroups: () => ({
    data: [
      { id: 'group-1', name: 'Weekend Warriors', role: 'member', member_count: 3 },
    ],
    isLoading: false,
  }),
}));

jest.mock('../../providers/ThemeProvider', () => ({
  useTheme: () => ({ isDark: true, toggleTheme: jest.fn() }),
}));

jest.mock('../../providers/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'me' } }),
}));

describe('ProposalsScreen (list)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Proposals header', () => {
    const { getByText } = renderWithProviders(<ProposalsScreen />);
    expect(getByText('Proposals')).toBeTruthy();
  });

  it('renders invited section with proposal', () => {
    const { getByText } = renderWithProviders(<ProposalsScreen />);
    expect(getByText('Friday tennis')).toBeTruthy();
  });

  it('shows Respond badge for pending proposals', () => {
    const { getByText } = renderWithProviders(<ProposalsScreen />);
    expect(getByText('Respond')).toBeTruthy();
  });
});

describe('CreateProposalScreen (form)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Propose a Hangout header', () => {
    const { getByText } = renderWithProviders(<CreateProposalScreen />);
    expect(getByText('Propose a Hangout')).toBeTruthy();
  });

  it('renders title input with placeholder', () => {
    const { getByPlaceholderText } = renderWithProviders(<CreateProposalScreen />);
    expect(getByPlaceholderText('e.g. Saturday tennis match')).toBeTruthy();
  });

  it('renders activity chips', () => {
    const { getByText } = renderWithProviders(<CreateProposalScreen />);
    expect(getByText('Dinner')).toBeTruthy();
    expect(getByText('Tennis')).toBeTruthy();
  });

  it('renders TBD date option', () => {
    const { getByText } = renderWithProviders(<CreateProposalScreen />);
    expect(getByText('TBD')).toBeTruthy();
  });

  it('renders Send Proposal button', () => {
    const { getByText } = renderWithProviders(<CreateProposalScreen />);
    expect(getByText('Send Proposal')).toBeTruthy();
  });

  it('shows alert when title is empty and Send is pressed', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText } = renderWithProviders(<CreateProposalScreen />);
    fireEvent.press(getByText('Send Proposal'));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'What are you doing?',
        expect.any(String)
      );
    });
  });

  it('shows alert when no friends or groups selected', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText, getByPlaceholderText } = renderWithProviders(<CreateProposalScreen />);
    fireEvent.changeText(getByPlaceholderText('e.g. Saturday tennis match'), 'Tennis tomorrow');
    fireEvent.press(getByText('Send Proposal'));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Who's invited?",
        expect.any(String)
      );
    });
  });
});
