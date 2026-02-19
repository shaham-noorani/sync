import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import ProposeScreen from '../../app/(tabs)/propose';
import { renderWithProviders } from '../test-utils';
import { supabase } from '../../lib/supabase';

// Mock the hooks to control data
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

jest.mock('../../hooks/useProposals', () => ({
  useCreateProposal: () => ({
    mutateAsync: jest.fn().mockResolvedValue({ id: 'new-proposal-id' }),
    isPending: false,
  }),
}));

jest.mock('../../providers/ThemeProvider', () => ({
  useTheme: () => ({ isDark: true, toggleTheme: jest.fn() }),
}));

describe('ProposeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form header', () => {
    const { getByText } = renderWithProviders(<ProposeScreen />);
    expect(getByText('Propose a Hangout')).toBeTruthy();
  });

  it('renders title input with placeholder', () => {
    const { getByPlaceholderText } = renderWithProviders(<ProposeScreen />);
    expect(getByPlaceholderText('e.g. Saturday tennis match')).toBeTruthy();
  });

  it('renders activity chips', () => {
    const { getByText } = renderWithProviders(<ProposeScreen />);
    expect(getByText('Dinner')).toBeTruthy();
    expect(getByText('Drinks')).toBeTruthy();
    expect(getByText('Tennis')).toBeTruthy();
  });

  it('renders TBD date option', () => {
    const { getByText } = renderWithProviders(<ProposeScreen />);
    expect(getByText('TBD')).toBeTruthy();
  });

  it('renders location input', () => {
    const { getByPlaceholderText } = renderWithProviders(<ProposeScreen />);
    expect(getByPlaceholderText('e.g. Dolores Park')).toBeTruthy();
  });

  it('renders friend from mock data', () => {
    const { getByText } = renderWithProviders(<ProposeScreen />);
    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('@alice')).toBeTruthy();
  });

  it('renders group from mock data', () => {
    const { getByText } = renderWithProviders(<ProposeScreen />);
    expect(getByText('Weekend Warriors')).toBeTruthy();
  });

  it('renders Send Proposal button', () => {
    const { getByText } = renderWithProviders(<ProposeScreen />);
    expect(getByText('Send Proposal')).toBeTruthy();
  });

  it('shows alert when title is empty and Send is pressed', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText } = renderWithProviders(<ProposeScreen />);
    fireEvent.press(getByText('Send Proposal'));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "What are you doing?",
        expect.any(String)
      );
    });
  });

  it('shows alert when no friends or groups selected', async () => {
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
    const { getByText, getByPlaceholderText } = renderWithProviders(<ProposeScreen />);
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
